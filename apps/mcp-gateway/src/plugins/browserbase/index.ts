/**
 * Browserbase MCP Plugin
 * Proxies tool calls to deployed @browserbasehq/mcp-server-browserbase instance
 */

import type { MCPPlugin, Env } from '../../types';
import { TOOLS } from './tools';
import { BrowserbaseClient } from './client';

// Map gateway tool names (bb_xxx) to remote tool names (browserbase_xxx)
const TOOL_NAME_MAP: Record<string, string> = {
  bb_session_create: 'browserbase_session_create',
  bb_session_close: 'browserbase_session_close',
  bb_navigate: 'browserbase_stagehand_navigate',
  bb_act: 'browserbase_stagehand_act',
  bb_extract: 'browserbase_stagehand_extract',
  bb_observe: 'browserbase_stagehand_observe',
  bb_screenshot: 'browserbase_screenshot',
  bb_get_url: 'browserbase_stagehand_get_url',
  bb_agent: 'browserbase_stagehand_agent',
};

export const browserbasePlugin: MCPPlugin = {
  id: 'browserbase',
  name: 'Browserbase',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>, env?: Env) {
    return new BrowserbaseClient({
      mcpUrl: env?.BROWSERBASE_MCP_URL || 'https://browserbase-mcp.node2flow.net',
      authToken: env?.BROWSERBASE_MCP_AUTH_TOKEN,
      apiKey: config.api_key as string,
      projectId: config.project_id as string,
      geminiApiKey: config.gemini_api_key as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const mcp = client as BrowserbaseClient;

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
