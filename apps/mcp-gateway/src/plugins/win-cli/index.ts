/**
 * Windows CLI Plugin - MCP Gateway
 * Proxies tool calls to win-cli-mcp-server via JSON-RPC
 * 9 tools: Command execution, SSH management, SSH execution
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { WinCliClient } from './client';

// Map from gateway prefixed tool names to original names
const TOOL_NAME_MAP: Record<string, string> = {};
for (const tool of TOOLS) {
  const originalName = tool.name.replace(/^cli_/, '');
  TOOL_NAME_MAP[tool.name] = originalName;
}

export const winCliPlugin: MCPPlugin = {
  id: 'win-cli',
  name: 'Windows CLI',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new WinCliClient({
      mcpUrl: config.mcp_url as string,
      authToken: config.auth_token as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const cli = client as WinCliClient;

    try {
      const originalName = TOOL_NAME_MAP[toolName] || toolName;
      const result = await cli.callTool(originalName, args);

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
