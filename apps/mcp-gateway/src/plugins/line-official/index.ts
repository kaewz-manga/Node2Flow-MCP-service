/**
 * LINE Official MCP Plugin
 * Proxies tool calls to deployed @line/line-bot-mcp-server instance
 */

import type { MCPPlugin, Env } from '../../types';
import { TOOLS } from './tools';
import { LineOfficialClient } from './client';

// Map gateway tool names (loff_xxx) to remote tool names (xxx)
const TOOL_NAME_MAP: Record<string, string> = {};
for (const tool of TOOLS) {
  const originalName = tool.name.replace(/^loff_/, '');
  TOOL_NAME_MAP[tool.name] = originalName;
}

export const lineOfficialPlugin: MCPPlugin = {
  id: 'line-official',
  name: 'LINE (Official)',
  version: '0.4.2',
  tools: TOOLS,

  createClient(config: Record<string, unknown>, env?: Env) {
    return new LineOfficialClient({
      mcpUrl: 'https://line-mcp-official.node2flow.net',
      authToken: env?.LINE_OFFICIAL_MCP_AUTH_TOKEN,
      channelAccessToken: config.channel_access_token as string | undefined,
      destinationUserId: config.destination_user_id as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const mcp = client as LineOfficialClient;

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
