/**
 * Node2Flow MCP Gateway Worker
 * All MCP products as plugins in a single Worker
 *
 * Routes:
 *   POST /mcp                        → MCP JSON-RPC 2.0 protocol (API key auth)
 *   GET  /api/connections             → List user connections (JWT auth)
 *   POST /api/connections             → Create connection (JWT auth)
 *   PUT  /api/connections/:id         → Update connection (JWT auth)
 *   DELETE /api/connections/:id       → Delete connection (JWT auth)
 *   GET  /api/proxy/:product/*        → Dashboard proxy routes (JWT auth)
 */

import type { Env } from './types';
import { getAllTools, getAllPlugins, getPlugin } from './plugin-registry';
import { handleMcpRequest } from './routes/mcp';
import { authenticateMcpRequest, authenticateDashboardRequest } from './routes/auth';
import { handleOAuthRoutes } from './routes/oauth';
import { handleGoogleWorkspaceOAuth, refreshGoogleTokenIfNeeded } from './routes/google-workspace-oauth';
import {
  handleListConnections,
  handleCreateConnection,
  handleDeleteConnection,
  handleUpdateConnection,
  getConnectionWithConfig,
} from './routes/connections';

// ============================================
// CORS & Response Helpers
// ============================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ============================================
// Main Handler
// ============================================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Health check
    if (path === '/' && method === 'GET') {
      const tools = getAllTools();
      const plugins = getAllPlugins();
      return json({
        service: 'node2flow-mcp-gateway',
        status: 'ok',
        version: '1.0.0',
        plugins: plugins.map(p => ({ id: p.id, name: p.name, version: p.version, tools: p.tools.length })),
        total_tools: tools.length,
      });
    }

    // ========================================
    // OAuth Endpoints (/.well-known/*, /oauth/*)
    // ========================================
    if (path.startsWith('/oauth/') || path.startsWith('/.well-known/')) {
      const oauthResponse = await handleOAuthRoutes(request, env, path, ctx);
      if (oauthResponse) return oauthResponse;
    }

    // ========================================
    // MCP Protocol (POST /mcp) - API Key or OAuth JWT Auth
    // ========================================
    if (path === '/mcp' && method === 'POST') {
      try {
        const { context, error } = await authenticateMcpRequest(request, env);

        if (error === 'OAUTH_REQUIRED' || (!context && !error)) {
          // Return 401 with OAuth metadata for MCP spec compliance
          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: { code: -32000, message: 'Authentication required' },
            }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
                'WWW-Authenticate': 'Bearer resource_metadata="https://mcp.node2flow.net/.well-known/oauth-protected-resource"',
                ...CORS_HEADERS,
              },
            }
          );
        }

        if (error || !context) {
          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: { code: -32000, message: error || 'Authentication failed' },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
          );
        }

        return handleMcpRequest(request, env, {
          user: { id: context.userId, email: context.email, plan: context.plan },
          connection: { id: context.connectionId, product_type: context.productType, config: context.config },
          apiKey: { id: context.apiKeyId },
          usage: context.usage,
          authMethod: context.authMethod,
          scope: context.scope,
        }, ctx);
      } catch (err) {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32603, message: `Internal error: ${err instanceof Error ? err.message : String(err)}` },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }
    }

    // ========================================
    // Google Workspace OAuth (callback is public, others need JWT)
    // ========================================
    if (path.startsWith('/api/oauth/google-workspace/')) {
      const user = path === '/api/oauth/google-workspace/callback' ? null : await authenticateDashboardRequest(request, env);
      const oauthRes = await handleGoogleWorkspaceOAuth(request, env, path, user?.userId || null, ctx);
      if (oauthRes) return oauthRes;
    }

    // ========================================
    // Dashboard API (JWT Auth)
    // ========================================
    if (path.startsWith('/api/')) {
      const user = await authenticateDashboardRequest(request, env);
      if (!user) {
        return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing token' } }, 401);
      }

      // --- Connection CRUD ---

      // GET /api/connections?product_type=n8n
      if (path === '/api/connections' && method === 'GET') {
        const productType = url.searchParams.get('product_type') || undefined;
        return handleListConnections(env, user.userId, productType);
      }

      // POST /api/connections
      if (path === '/api/connections' && method === 'POST') {
        const body = await request.json() as { product_type: string; name: string; config: Record<string, unknown> };
        return handleCreateConnection(env, user.userId, body);
      }

      // PUT /api/connections/:id
      const updateMatch = path.match(/^\/api\/connections\/([^/]+)$/);
      if (updateMatch && method === 'PUT') {
        const body = await request.json() as { name?: string; config?: Record<string, unknown>; status?: string };
        return handleUpdateConnection(env, user.userId, updateMatch[1], body);
      }

      // DELETE /api/connections/:id
      const deleteMatch = path.match(/^\/api\/connections\/([^/]+)$/);
      if (deleteMatch && method === 'DELETE') {
        return handleDeleteConnection(env, user.userId, deleteMatch[1]);
      }

      // --- Proxy Routes (per product) ---

      // /api/proxy/:product_type/:connection_id/*
      const proxyMatch = path.match(/^\/api\/proxy\/([^/]+)\/([^/]+)\/(.+)$/);
      if (proxyMatch) {
        const [, productType, connectionId, subPath] = proxyMatch;
        const plugin = getPlugin(productType);

        if (!plugin) {
          return json({ success: false, error: { code: 'INVALID_PRODUCT', message: `Unknown product: ${productType}` } }, 400);
        }

        // Get connection with decrypted config
        const conn = await getConnectionWithConfig(env, connectionId);
        if (!conn || conn.user_id !== user.userId) {
          return json({ success: false, error: { code: 'NOT_FOUND', message: 'Connection not found' } }, 404);
        }

        // Auto-refresh Google token if expired
        if (productType === 'google-workspace' && conn.config.oauth_token) {
          conn.config = await refreshGoogleTokenIfNeeded(conn.config, env, connectionId);
        }

        // Create client and proxy the request
        const client = plugin.createClient(conn.config, env);

        try {
          let toolName: string;
          let args: Record<string, unknown>;

          if (method === 'POST' && subPath === 'tool') {
            // Explicit tool call: POST /api/proxy/:product/:conn/tool
            // Body: { tool: "wp_list_posts", args: { per_page: 10 } }
            const body = await request.json() as { tool: string; args?: Record<string, unknown> };
            toolName = body.tool;
            args = body.args || {};
          } else {
            // Legacy path-based mapping
            toolName = `${productType}_${subPath.replace(/\//g, '_')}`;
            args = Object.fromEntries(url.searchParams);
          }

          const result = await plugin.handleToolCall(toolName, args, client);

          // Unwrap MCP result format → return clean data for dashboard
          if (result && !result.isError && result.content?.[0]?.text) {
            try {
              const parsed = JSON.parse(result.content[0].text);
              return json({ success: true, data: parsed });
            } catch {
              return json({ success: true, data: result });
            }
          }

          if (result?.isError) {
            const msg = result.content?.[0]?.text || 'Tool call failed';
            return json({ success: false, error: { code: 'TOOL_ERROR', message: msg } }, 400);
          }

          return json({ success: true, data: result });
        } catch (err) {
          return json({ success: false, error: { code: 'PROXY_ERROR', message: err instanceof Error ? err.message : String(err) } }, 500);
        }
      }

      // --- Plugin Info ---

      // GET /api/plugins
      if (path === '/api/plugins' && method === 'GET') {
        const plugins = getAllPlugins();
        return json({
          success: true,
          data: {
            plugins: plugins.map(p => ({
              id: p.id,
              name: p.name,
              version: p.version,
              tools_count: p.tools.length,
            })),
          },
        });
      }

      // GET /api/plugins/:id/tools
      const pluginToolsMatch = path.match(/^\/api\/plugins\/([^/]+)\/tools$/);
      if (pluginToolsMatch && method === 'GET') {
        const plugin = getPlugin(pluginToolsMatch[1]);
        if (!plugin) {
          return json({ success: false, error: { code: 'NOT_FOUND', message: 'Plugin not found' } }, 404);
        }
        return json({
          success: true,
          data: {
            plugin_id: plugin.id,
            plugin_name: plugin.name,
            tools: plugin.tools.map(t => ({
              name: t.name,
              description: t.description,
              inputSchema: t.inputSchema,
            })),
          },
        });
      }

      return json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } }, 404);
    }

    return json({ error: 'Not found' }, 404);
  },
} satisfies ExportedHandler<Env>;
