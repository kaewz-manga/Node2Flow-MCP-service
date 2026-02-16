/**
 * Qdrant MCP Proxy Client
 * Forwards JSON-RPC tool calls to deployed mcp-server-qdrant instance
 */

import type { QdrantConfig } from './types';

export class QdrantClient {
  constructor(private config: QdrantConfig) {}

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const mcpEndpoint = `${this.config.mcpUrl.replace(/\/$/, '')}/mcp`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    // Pass user's Qdrant credentials per-request via headers
    headers['x-service-token'] = this.config.qdrantUrl;
    headers['x-service-token-env'] = 'QDRANT_URL';

    // Bridge expects comma-separated KEY=VALUE format
    const extraParts = [`COLLECTION_NAME=${this.config.collectionName}`];
    if (this.config.apiKey) {
      extraParts.push(`QDRANT_API_KEY=${this.config.apiKey}`);
    }
    if (this.config.embeddingModel) {
      extraParts.push(`EMBEDDING_MODEL=${this.config.embeddingModel}`);
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
      throw new Error(`Qdrant MCP returned ${response.status}: ${text}`);
    }

    const data = await response.json() as any;

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from Qdrant MCP');
    }

    return data.result;
  }
}
