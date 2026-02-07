/**
 * cl-n8n-mcp Plugin - MCP Gateway
 * Proxies tool calls to cl-n8n-mcp server via JSON-RPC
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { ClN8nMcpClient } from './client';

// Map from gateway prefixed tool names to cl-n8n-mcp original names
const TOOL_NAME_MAP: Record<string, string> = {};
for (const tool of TOOLS) {
  // mcp_search_nodes -> search_nodes, mcp_n8n_create_workflow -> n8n_create_workflow
  const originalName = tool.name.replace(/^mcp_/, '');
  TOOL_NAME_MAP[tool.name] = originalName;
}

export const clN8nMcpPlugin: MCPPlugin = {
  id: 'cl-n8n-mcp',
  name: 'n8n Workflow Builder',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new ClN8nMcpClient({
      mcpUrl: config.mcp_url as string,
      authToken: config.auth_token as string,
      n8nUrl: config.n8n_url as string | undefined,
      n8nApiKey: config.n8n_api_key as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const mcp = client as ClN8nMcpClient;

    try {
      // Map prefixed name back to original
      const originalName = TOOL_NAME_MAP[toolName] || toolName;
      const result = await mcp.callTool(originalName, args);

      // cl-n8n-mcp returns { content: [...] } format already
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
