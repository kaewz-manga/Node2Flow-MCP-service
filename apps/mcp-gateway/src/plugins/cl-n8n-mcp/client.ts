/**
 * cl-n8n-mcp Client
 * Proxies tool calls to cl-n8n-mcp instance via JSON-RPC 2.0
 */

import type { ClN8nMcpConfig } from './types';

export class ClN8nMcpClient {
  constructor(private config: ClN8nMcpConfig) {}

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const mcpEndpoint = `${this.config.mcpUrl.replace(/\/$/, '')}/mcp`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.authToken}`,
    };

    // Pass n8n credentials for management tools
    if (this.config.n8nUrl) {
      headers['x-n8n-url'] = this.config.n8nUrl;
    }
    if (this.config.n8nApiKey) {
      headers['x-n8n-key'] = this.config.n8nApiKey;
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
      throw new Error(`cl-n8n-mcp returned ${response.status}: ${text}`);
    }

    const data = await response.json() as any;

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from cl-n8n-mcp');
    }

    // Return the MCP result content
    return data.result;
  }
}
