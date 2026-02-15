/**
 * Browserbase MCP Proxy Client
 * Forwards JSON-RPC tool calls to deployed @browserbasehq/mcp-server-browserbase instance
 */

import type { BrowserbaseConfig } from './types';

export class BrowserbaseClient {
  constructor(private config: BrowserbaseConfig) {}

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const mcpEndpoint = `${this.config.mcpUrl.replace(/\/$/, '')}/mcp`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    // Pass user's Browserbase credentials per-request via headers
    headers['x-service-token'] = this.config.apiKey;
    headers['x-service-token-env'] = 'BROWSERBASE_API_KEY';

    // Bridge expects comma-separated KEY=VALUE format
    const extraParts = [`BROWSERBASE_PROJECT_ID=${this.config.projectId}`];
    if (this.config.geminiApiKey) {
      extraParts.push(`GEMINI_API_KEY=${this.config.geminiApiKey}`);
    }
    headers['x-service-extra-env'] = extraParts.join(',');

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
      throw new Error(`Browserbase MCP returned ${response.status}: ${text}`);
    }

    const data = await response.json() as any;

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from Browserbase MCP');
    }

    return data.result;
  }
}
