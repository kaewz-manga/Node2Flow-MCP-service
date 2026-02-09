/**
 * Windows CLI MCP Client
 * Proxies tool calls to win-cli-mcp-server via JSON-RPC 2.0
 */

import type { WinCliConfig } from './types';

export class WinCliClient {
  constructor(private config: WinCliConfig) {}

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const mcpEndpoint = `${this.config.mcpUrl.replace(/\/$/, '')}/mcp`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

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
      throw new Error(`win-cli-mcp returned ${response.status}: ${text}`);
    }

    const data = await response.json() as any;

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from win-cli-mcp');
    }

    return data.result;
  }
}
