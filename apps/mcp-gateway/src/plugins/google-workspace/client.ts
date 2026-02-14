/**
 * Google Workspace MCP Proxy Client
 * Forwards JSON-RPC tool calls to deployed google-workspace-server instance
 */

import type { GoogleWorkspaceConfig } from './types';

export class GoogleWorkspaceClient {
  constructor(private config: GoogleWorkspaceConfig) {}

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const mcpEndpoint = `${this.config.mcpUrl.replace(/\/$/, '')}/mcp`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    // Pass user's Google credentials per-request via headers
    // Priority: OAuth token > service account JSON
    if (this.config.oauthToken) {
      headers['x-service-token'] = this.config.oauthToken;
      headers['x-service-token-env'] = 'GOOGLE_OAUTH_TOKEN';
    } else if (this.config.serviceAccountJson) {
      headers['x-service-token'] = this.config.serviceAccountJson;
      headers['x-service-token-env'] = 'GOOGLE_SERVICE_ACCOUNT';
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
      throw new Error(`Google Workspace MCP returned ${response.status}: ${text}`);
    }

    const data = await response.json() as any;

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from Google Workspace MCP');
    }

    return data.result;
  }
}
