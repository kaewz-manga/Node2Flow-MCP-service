/**
 * Notion Official MCP Plugin
 * Proxies tool calls to deployed @notionhq/notion-mcp-server instance
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { NotionOfficialClient } from './client';

// Map gateway tool names (noff_xxx) to remote tool names (xxx with hyphens)
const TOOL_NAME_MAP: Record<string, string> = {};
for (const tool of TOOLS) {
  const originalName = tool.name
    .replace(/^noff_/, '')
    .replace(/_/g, '-');
  TOOL_NAME_MAP[tool.name] = originalName;
}

export const notionOfficialPlugin: MCPPlugin = {
  id: 'notion-official',
  name: 'Notion (Official)',
  version: '2.1.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new NotionOfficialClient({
      mcpUrl: config.mcp_url as string,
      authToken: config.auth_token as string | undefined,
      notionToken: config.notion_token as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const mcp = client as NotionOfficialClient;

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
