/**
 * Brightdata MCP Plugin - MCP Gateway
 * Proxies tool calls to Bright Data hosted MCP server via JSON-RPC
 * https://github.com/brightdata/brightdata-mcp
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { BrightdataClient } from './client';

// Map from gateway prefixed tool names to Brightdata original names
const TOOL_NAME_MAP: Record<string, string> = {};
for (const tool of TOOLS) {
  // brightdata_search_engine -> search_engine
  // brightdata_web_data_amazon_product -> web_data_amazon_product
  // brightdata_scraping_browser_navigate -> scraping_browser_navigate
  const originalName = tool.name.replace(/^brightdata_/, '');
  TOOL_NAME_MAP[tool.name] = originalName;
}

export const brightdataPlugin: MCPPlugin = {
  id: 'brightdata',
  name: 'Bright Data Web Scraping',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new BrightdataClient({
      apiToken: config.api_token as string,
      mcpUrl: config.mcp_url as string | undefined,
      proMode: config.pro_mode as boolean | undefined,
      browserZone: config.browser_zone as string | undefined,
      webUnlockerZone: config.web_unlocker_zone as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const brightdata = client as BrightdataClient;

    try {
      // Map prefixed name back to original
      const originalName = TOOL_NAME_MAP[toolName] || toolName;
      const result = await brightdata.callTool(originalName, args);

      // Brightdata MCP returns { content: [...] } format
      const resultObj = result as Record<string, unknown>;
      if (result && typeof result === 'object' && 'content' in resultObj) {
        return {
          content: resultObj.content as { type: string; text: string }[],
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
