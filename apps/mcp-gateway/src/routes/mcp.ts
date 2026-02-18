/**
 * MCP JSON-RPC 2.0 Protocol Handler
 * Shared across all plugins - routes tool calls through plugin registry
 */

import type { Env, MCPToolDefinition, MCPToolResult, Connection } from '../types';
import { getAllTools, getPlugin, findPluginForTool } from '../plugin-registry';
import { decryptConfig } from './connections';
import { refreshGoogleTokenIfNeeded } from './google-workspace-oauth';

/**
 * Filter tools by scope (plugin + permission restrictions)
 */
function filterToolsByScope(
  tools: MCPToolDefinition[],
  scope: { plugins?: string[]; permissions?: string[] },
  pluginIdForTool: (toolName: string) => string | null
): MCPToolDefinition[] {
  return tools.filter(t => {
    // Check plugin scope
    if (scope.plugins) {
      const pluginId = pluginIdForTool(t.name);
      if (!pluginId || !scope.plugins.includes(pluginId)) return false;
    }
    // Check permission scope
    if (scope.permissions) {
      if (!matchesPermission(t, scope.permissions)) return false;
    }
    return true;
  });
}

/**
 * Check if a tool matches the allowed permissions based on annotations
 * read = readOnlyHint: true
 * write = not readOnly and not destructive
 * delete = destructiveHint: true
 */
function matchesPermission(tool: MCPToolDefinition, permissions: string[]): boolean {
  const ann = tool.annotations;
  if (!ann) return permissions.includes('write'); // no annotations = assume write
  if (ann.readOnlyHint) return permissions.includes('read');
  if (ann.destructiveHint) return permissions.includes('delete');
  return permissions.includes('write');
}

interface AuthContext {
  user: { id: string; email: string; plan: string };
  connection: { id: string | null; product_type: string | null; config: Record<string, unknown> | null };
  apiKey: { id: string };
  usage: { current: number; limit: number; remaining: number };
  authMethod: 'api_key' | 'oauth';
  scope: { plugins?: string[]; permissions?: string[] } | null;
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
  const clientName = request.headers.get('User-Agent') || null;

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
        let tools: MCPToolDefinition[];

        if (authContext.connection.product_type) {
          // Single-connection API key → return specific plugin's tools
          const plugin = getPlugin(authContext.connection.product_type);
          tools = plugin ? [...plugin.tools] : [];
        } else {
          // OAuth JWT or _all API key → return tools from all active connections
          const connections = await env.DB.prepare(
            'SELECT DISTINCT product_type FROM connections WHERE user_id = ? AND status = ?'
          ).bind(authContext.user.id, 'active').all<{ product_type: string }>();

          tools = (connections.results || []).flatMap(c => {
            const plugin = getPlugin(c.product_type);
            return plugin ? plugin.tools : [];
          });
        }

        // Apply scope filtering if present
        if (authContext.scope) {
          tools = filterToolsByScope(tools, authContext.scope, (name) => {
            const p = findPluginForTool(name);
            return p ? p.id : null;
          });
        }

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

        // Enforce scope restrictions
        if (authContext.scope) {
          if (authContext.scope.plugins && !authContext.scope.plugins.includes(plugin.id)) {
            return jsonRpcError(id, -32001, `Tool "${toolName}" not allowed by API key scope (plugin: ${plugin.id})`);
          }
          if (authContext.scope.permissions) {
            const toolDef = plugin.tools.find(t => t.name === toolName);
            if (toolDef && !matchesPermission(toolDef, authContext.scope.permissions)) {
              return jsonRpcError(id, -32001, `Tool "${toolName}" not allowed by API key scope (permission denied)`);
            }
          }
        }

        // Resolve connection config
        let connectionConfig = authContext.connection.config;
        let connectionId = authContext.connection.id;

        if (!connectionConfig) {
          // OAuth JWT or global API key → find connection by user_id + product_type
          const conns = await env.DB.prepare(
            'SELECT * FROM connections WHERE user_id = ? AND product_type = ? AND status = ?'
          ).bind(authContext.user.id, plugin.id, 'active').all<Connection>();

          if (!conns.results?.length) {
            return jsonRpcError(id, -32000, `No active ${plugin.id} connection. Set up in dashboard first.`);
          }

          if (conns.results.length > 1) {
            return jsonRpcError(id, -32000, `Multiple ${plugin.id} connections found. Use a connection-specific API key to select which one.`);
          }

          const conn = conns.results[0];
          connectionConfig = await decryptConfig(conn.config_encrypted, env.ENCRYPTION_KEY);
          connectionId = conn.id;
        }

        // Auto-refresh Google token if expired
        if (plugin.id === 'google-workspace' && connectionConfig.oauth_token && connectionId) {
          connectionConfig = await refreshGoogleTokenIfNeeded(connectionConfig, env, connectionId);
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
                client_name: clientName,
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
