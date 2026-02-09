/**
 * Playwright MCP Plugin
 * Proxies tool calls to deployed @playwright/mcp instance
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { PlaywrightClient } from './client';

// Map gateway tool names (pw_xxx) to remote tool names (xxx)
const TOOL_NAME_MAP: Record<string, string> = {};
for (const tool of TOOLS) {
  const originalName = tool.name.replace(/^pw_/, '');
  TOOL_NAME_MAP[tool.name] = originalName;
}

export const playwrightPlugin: MCPPlugin = {
  id: 'playwright',
  name: 'Browser Automation',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new PlaywrightClient({
      mcpUrl: config.mcp_url as string,
      authToken: config.auth_token as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const mcp = client as PlaywrightClient;

    try {
      const originalName = TOOL_NAME_MAP[toolName] || toolName;
      const result = await mcp.callTool(originalName, args);

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
