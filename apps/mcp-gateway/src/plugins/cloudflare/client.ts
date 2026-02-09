/**
 * Cloudflare MCP Client
 * Routes tool calls to the correct Cloudflare hosted MCP service via JSON-RPC 2.0.
 * Cloudflare operates 15 separate MCP servers, each at its own subdomain.
 */

import type { CloudflareConfig } from './types';
import { SERVICE_ENDPOINTS } from './types';
import { TOOL_SERVICE_MAP } from './tools';

export class CloudflareClient {
  constructor(private config: CloudflareConfig) {}

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const service = TOOL_SERVICE_MAP[toolName];
    if (!service) {
      throw new Error(`Unknown Cloudflare tool: ${toolName}`);
    }

    const endpoint = SERVICE_ENDPOINTS[service];
    if (!endpoint) {
      throw new Error(`Unknown Cloudflare service: ${service}`);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiToken}`,
    };

    const response = await fetch(endpoint, {
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
      throw new Error(`Cloudflare ${service} MCP returned ${response.status}: ${text}`);
    }

    const data = await response.json() as any;

    if (data.error) {
      throw new Error(data.error.message || `Unknown error from Cloudflare ${service} MCP`);
    }

    return data.result;
  }
}
