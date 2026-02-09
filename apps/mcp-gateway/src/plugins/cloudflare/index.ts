/**
 * Cloudflare MCP Plugin - MCP Gateway
 * Proxies tool calls to Cloudflare's 15 hosted MCP servers via JSON-RPC.
 * Routes each tool to the correct service endpoint based on TOOL_SERVICE_MAP.
 * https://github.com/cloudflare/mcp-server-cloudflare
 */

import type { MCPPlugin } from '../../types';
import { TOOLS, TOOL_SERVICE_MAP } from './tools';
import { CloudflareClient } from './client';

// Map from gateway prefixed tool names (cf_*) to original Cloudflare tool names
const TOOL_NAME_MAP: Record<string, string> = {};
for (const tool of TOOLS) {
  const originalName = tool.name.replace(/^cf_/, '');
  TOOL_NAME_MAP[tool.name] = originalName;
}

export const cloudflarePlugin: MCPPlugin = {
  id: 'cloudflare',
  name: 'Cloudflare Platform',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new CloudflareClient({
      apiToken: config.api_token as string,
      accountId: config.account_id as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const cf = client as CloudflareClient;

    try {
      // Map prefixed name back to original
      const originalName = TOOL_NAME_MAP[toolName] || toolName;
      const result = await cf.callTool(originalName, args);

      // Cloudflare MCP returns { content: [...] } format
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
