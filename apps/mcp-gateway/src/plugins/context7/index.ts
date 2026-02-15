/**
 * Context7 Plugin - MCP Gateway
 * Proxies tool calls to Context7 MCP server (public, no auth required)
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { Context7Client } from './client';

const TOOL_NAME_MAP: Record<string, string> = {
  'context7_resolve_library_id': 'resolve-library-id',
  'context7_query_docs': 'query-docs',
};

export const context7Plugin: MCPPlugin = {
  id: 'context7',
  name: 'Context7 Documentation',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new Context7Client({
      mcpUrl: (config.mcp_url as string) || 'https://mcp.context7.com/mcp',
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const ctx = client as Context7Client;

    try {
      const originalName = TOOL_NAME_MAP[toolName] || toolName;
      const result = await ctx.callTool(originalName, args);

      if (result && typeof result === 'object' && 'content' in (result as any)) {
        return {
          content: (result as any).content,
          isError: false,
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  },
};
