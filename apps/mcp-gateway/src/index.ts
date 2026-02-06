// Node2Flow MCP Gateway Worker
// All MCP products as plugins in a single Worker
//
// Routes:
//   POST /mcp              → MCP JSON-RPC 2.0 protocol
//   GET  /api/connections   → List user connections (per product_type)
//   POST /api/connections   → Create connection
//   DELETE /api/connections/:id → Delete connection
//   /api/proxy/*            → Dashboard proxy routes (per product)

import type { Env } from './types';
import { getAllTools } from './plugin-registry';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/' && request.method === 'GET') {
      const tools = getAllTools();
      return Response.json({
        service: 'node2flow-mcp-gateway',
        status: 'ok',
        version: '0.1.0',
        total_tools: tools.length,
      });
    }

    // TODO: Phase 3 - MCP protocol handler (POST /mcp)
    // TODO: Phase 3 - Connection CRUD routes
    // TODO: Phase 3 - Dashboard proxy routes

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
