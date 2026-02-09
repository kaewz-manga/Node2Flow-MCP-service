/**
 * LINE Official MCP Proxy Client
 * Forwards JSON-RPC tool calls to deployed LINE MCP server
 */

import type { LineOfficialConfig } from './types';

export class LineOfficialClient {
  constructor(private config: LineOfficialConfig) {}

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const mcpEndpoint = `${this.config.mcpUrl.replace(/\/$/, '')}/mcp`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    // Pass user's LINE credentials per-request via headers
    if (this.config.channelAccessToken) {
      headers['x-service-token'] = this.config.channelAccessToken;
      headers['x-service-token-env'] = 'CHANNEL_ACCESS_TOKEN';
    }
    if (this.config.destinationUserId) {
      headers['x-service-extra-env'] = `DESTINATION_USER_ID=${this.config.destinationUserId}`;
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
      throw new Error(`LINE Official MCP returned ${response.status}: ${text}`);
    }

    const data = await response.json() as any;

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from LINE Official MCP');
    }

    return data.result;
  }
}
