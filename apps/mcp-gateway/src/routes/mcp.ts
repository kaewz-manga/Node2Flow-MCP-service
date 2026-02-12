/**
 * MCP JSON-RPC 2.0 Protocol Handler
 * Shared across all plugins - routes tool calls through plugin registry
 */

import type { Env, MCPToolResult, Connection } from '../types';
import { getAllTools, getPlugin, findPluginForTool } from '../plugin-registry';
import { decryptConfig } from './connections';

interface AuthContext {
  user: { id: string; email: string; plan: string };
  connection: { id: string | null; product_type: string | null; config: Record<string, unknown> | null };
  apiKey: { id: string };
  usage: { current: number; limit: number; remaining: number };
  authMethod: 'api_key' | 'oauth';
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonRpcResponse(id: string | number | null, result: unknown, rateLimitInfo?: RateLimitInfo): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...CORS_HEADERS,
  };

  if (rateLimitInfo) {
    headers['X-RateLimit-Limit'] = String(rateLimitInfo.limit);
    headers['X-RateLimit-Remaining'] = String(rateLimitInfo.remaining);
    headers['X-RateLimit-Reset'] = rateLimitInfo.reset;
  }

  return new Response(
    JSON.stringify({ jsonrpc: '2.0', id, result }),
    { headers }
  );
}

function jsonRpcError(id: string | number | null, code: number, message: string): Response {
  return new Response(
    JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }),
    {
      status: code === -32600 ? 400 : 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    }
  );
}

function getTomorrowReset(): string {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.toISOString();
}

export async function handleMcpRequest(
  request: Request,
  env: Env,
  authContext: AuthContext,
  ctx: ExecutionContext
): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonRpcError(null, -32700, 'Parse error: Invalid JSON');
  }

  const { jsonrpc, id, method, params } = body as {
    jsonrpc: string;
    id: string | number | null;
    method: string;
    params: Record<string, unknown>;
  };

  if (jsonrpc !== '2.0') {
    return jsonRpcError(id, -32600, 'Invalid Request: jsonrpc must be "2.0"');
  }

  const rateLimitInfo: RateLimitInfo = {
    limit: authContext.usage.limit,
    remaining: authContext.usage.remaining,
    reset: getTomorrowReset(),
  };

  try {
    switch (method) {
      case 'initialize': {
        return jsonRpcResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'node2flow-mcp-gateway',
            version: '1.0.0',
          },
        }, rateLimitInfo);
      }

      case 'notifications/initialized': {
        return jsonRpcResponse(id, {}, rateLimitInfo);
      }

      case 'tools/list': {
        if (authContext.authMethod === 'api_key' && authContext.connection.product_type) {
          // API key auth → return specific plugin's tools
          const plugin = getPlugin(authContext.connection.product_type);
          const tools = plugin ? plugin.tools : getAllTools();
          return jsonRpcResponse(id, { tools }, rateLimitInfo);
        }

        // OAuth JWT → return tools from all products with active connections
        const connections = await env.DB.prepare(
          'SELECT DISTINCT product_type FROM connections WHERE user_id = ? AND status = ?'
        ).bind(authContext.user.id, 'active').all<{ product_type: string }>();

        const tools = (connections.results || []).flatMap(c => {
          const plugin = getPlugin(c.product_type);
          return plugin ? plugin.tools : [];
        });
        return jsonRpcResponse(id, { tools }, rateLimitInfo);
      }

      case 'tools/call': {
        const startTime = Date.now();
        const { name: toolName, arguments: args } = params as {
          name: string;
          arguments: Record<string, unknown>;
        };

        // Find the plugin that handles this tool
        const plugin = findPluginForTool(toolName);
        if (!plugin) {
          return jsonRpcError(id, -32601, `Unknown tool: ${toolName}`);
        }

        // Resolve connection config
        let connectionConfig = authContext.connection.config;
        let connectionId = authContext.connection.id;

        if (!connectionConfig) {
          // OAuth JWT → find connection by user_id + product_type
          const conn = await env.DB.prepare(
            'SELECT * FROM connections WHERE user_id = ? AND product_type = ? AND status = ? LIMIT 1'
          ).bind(authContext.user.id, plugin.id, 'active').first<Connection>();

          if (!conn) {
            return jsonRpcError(id, -32000, `No active ${plugin.id} connection. Set up in dashboard first.`);
          }

          connectionConfig = await decryptConfig(conn.config_encrypted, env.ENCRYPTION_KEY);
          connectionId = conn.id;
        }

        // Create client from decrypted connection config
        const client = plugin.createClient(connectionConfig, env);

        // Execute tool call through plugin
        const result: MCPToolResult = await plugin.handleToolCall(toolName, args || {}, client);
        const responseTime = Date.now() - startTime;

        const isError = result.isError || false;

        // Update connection last_used_at in products-db (non-blocking)
        if (connectionId) {
          ctx.waitUntil(
            env.DB.prepare('UPDATE connections SET last_used_at = ? WHERE id = ?')
              .bind(new Date().toISOString(), connectionId)
              .run()
              .catch(() => {})
          );
        }

        // Report usage to Platform (non-blocking via service binding)
        ctx.waitUntil(
          env.PLATFORM.fetch(
            new Request('https://platform.internal/internal/report-usage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: authContext.user.id,
                api_key_id: authContext.apiKey.id,
                connection_id: connectionId || 'oauth',
                tool_name: toolName,
                status: isError ? 'error' : 'success',
                response_time_ms: responseTime,
                error_message: isError ? result.content?.[0]?.text : undefined,
              }),
            })
          ).catch(() => {}) // Silently ignore reporting errors
        );

        // Update remaining count
        if (rateLimitInfo.remaining > 0) {
          rateLimitInfo.remaining = rateLimitInfo.remaining - 1;
        }

        return jsonRpcResponse(id, result, rateLimitInfo);
      }

      case 'ping': {
        return jsonRpcResponse(id, {}, rateLimitInfo);
      }

      default: {
        return jsonRpcError(id, -32601, `Method not found: ${method}`);
      }
    }
  } catch (error) {
    return jsonRpcError(id, -32603, `Internal error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
