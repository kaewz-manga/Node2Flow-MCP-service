/**
 * Brightdata MCP Client
 * Proxies tool calls to Brightdata hosted MCP server via JSON-RPC 2.0
 */

import type { BrightdataConfig } from './types';

interface MCPResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

const DEFAULT_MCP_URL = 'https://mcp.brightdata.com';

export class BrightdataClient {
  constructor(private config: BrightdataConfig) {
    if (!config.apiToken || config.apiToken.trim() === '') {
      throw new Error('Bright Data API token is required');
    }
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const baseUrl = (this.config.mcpUrl || DEFAULT_MCP_URL).replace(/\/$/, '');
    const mcpEndpoint = `${baseUrl}/mcp`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiToken}`,
    };

    const response = await fetch(mcpEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Brightdata MCP returned ${response.status}: ${text}`);
    }

    const data: MCPResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from Brightdata MCP');
    }

    return data.result;
  }
}
