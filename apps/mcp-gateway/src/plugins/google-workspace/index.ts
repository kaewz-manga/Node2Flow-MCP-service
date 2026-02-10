/**
 * Google Workspace MCP Plugin
 * Proxies tool calls to deployed google-workspace-server instance
 */

import type { MCPPlugin, Env } from '../../types';
import { TOOLS } from './tools';
import { GoogleWorkspaceClient } from './client';

// Map gateway tool names (gws_xxx_yyy) to remote tool names (xxx_yyy)
const TOOL_NAME_MAP: Record<string, string> = {};
for (const tool of TOOLS) {
  const originalName = tool.name.replace(/^gws_/, '');
  TOOL_NAME_MAP[tool.name] = originalName;
}

export const googleWorkspacePlugin: MCPPlugin = {
  id: 'google-workspace',
  name: 'Google Workspace',
  version: '1.0.0',
  tools: TOOLS,

  createClient(_config: Record<string, unknown>, env?: Env) {
    return new GoogleWorkspaceClient({
      mcpUrl: 'https://google-workspace-mcp.node2flow.net',
      authToken: env?.GOOGLE_WORKSPACE_MCP_AUTH_TOKEN,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const mcp = client as GoogleWorkspaceClient;

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
