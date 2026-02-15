/**
 * Context7 Client
 * Proxies tool calls to Context7 MCP server via Streamable HTTP
 */

import type { Context7Config } from './types';

export class Context7Client {
  private config: Context7Config;
  private sessionId: string | null = null;

  constructor(config: Context7Config) {
    this.config = config;
  }

  private async sendRequest(method: string, params: Record<string, unknown>): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };

    if (this.sessionId) {
      headers['mcp-session-id'] = this.sessionId;
    }

    const response = await fetch(this.config.mcpUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Context7 returned ${response.status}: ${text}`);
    }

    const newSessionId = response.headers.get('mcp-session-id');
    if (newSessionId) {
      this.sessionId = newSessionId;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      return this.parseSSE(await response.text());
    }

    return await response.json();
  }

  private parseSSE(text: string): any {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          return JSON.parse(line.slice(6));
        } catch { /* skip invalid JSON */ }
      }
    }
    throw new Error('No valid data in SSE response');
  }

  async initialize(): Promise<void> {
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'node2flow-gateway', version: '1.0.0' },
    });
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    if (!this.sessionId) {
      await this.initialize();
    }

    const data = await this.sendRequest('tools/call', {
      name: toolName,
      arguments: args,
    });

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from Context7');
    }

    return data.result;
  }
}
