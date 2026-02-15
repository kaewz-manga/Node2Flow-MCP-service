/**
 * cl-n8n-mcp Client
 * Proxies tool calls to cl-n8n-mcp instance via Streamable HTTP (SSE)
 */

import type { ClN8nMcpConfig } from './types';

export class ClN8nMcpClient {
  private sessionId: string | null = null;
  private authToken?: string;

  constructor(config: ClN8nMcpConfig, authToken?: string) {
    this.config = config;
    this.authToken = authToken;
  }

  private config: ClN8nMcpConfig;

  private async sendRequest(method: string, params: Record<string, unknown>): Promise<any> {
    const mcpEndpoint = `${this.config.mcpUrl.replace(/\/$/, '')}/mcp`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    if (this.sessionId) {
      headers['mcp-session-id'] = this.sessionId;
    }

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
        method,
        params,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`cl-n8n-mcp returned ${response.status}: ${text}`);
    }

    // Save session ID from response
    const newSessionId = response.headers.get('mcp-session-id');
    if (newSessionId) {
      this.sessionId = newSessionId;
    }

    // Parse SSE or JSON response
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      return this.parseSSE(await response.text());
    }

    return await response.json();
  }

  private parseSSE(text: string): any {
    // Parse SSE format: "event: message\ndata: {...}\n\n"
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
    // Initialize session if needed
    if (!this.sessionId) {
      await this.initialize();
    }

    const data = await this.sendRequest('tools/call', {
      name: toolName,
      arguments: args,
    });

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from cl-n8n-mcp');
    }

    return data.result;
  }
}
