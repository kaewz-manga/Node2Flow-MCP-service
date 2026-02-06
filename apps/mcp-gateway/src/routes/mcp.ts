/**
 * MCP JSON-RPC 2.0 Protocol Handler
 * Shared across all plugins - routes tool calls through plugin registry
 */

import type { Env, MCPToolResult } from '../types';
import { getAllTools, findPluginForTool } from '../plugin-registry';

interface AuthContext {
  user: { id: string; email: string; plan: string };
  connection: { id: string; product_type: string; config: Record<string, unknown> };
  apiKey: { id: string };
  usage: { current: number; limit: number; remaining: number };
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
  authContext: AuthContext
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
        // Return tools for the specific product this API key is bound to
        const plugin = findPluginForTool(authContext.connection.product_type);
        const tools = plugin ? plugin.tools : getAllTools();
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

        // Create client from decrypted connection config
        const client = plugin.createClient(authContext.connection.config);

        // Execute tool call through plugin
        const result: MCPToolResult = await plugin.handleToolCall(toolName, args || {}, client);
        const responseTime = Date.now() - startTime;

        // Report usage to Platform (non-blocking via service binding)
        // In production, this calls env.PLATFORM.fetch() to report usage
        const isError = result.isError || false;

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
