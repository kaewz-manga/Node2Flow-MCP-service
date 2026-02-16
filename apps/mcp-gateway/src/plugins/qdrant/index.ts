/**
 * Qdrant MCP Plugin
 * Proxies tool calls to deployed mcp-server-qdrant instance
 */

import type { MCPPlugin, Env } from '../../types';
import { TOOLS } from './tools';
import { QdrantClient } from './client';

// Map gateway tool names (qd_xxx) to remote tool names (qdrant-xxx)
const TOOL_NAME_MAP: Record<string, string> = {
  qd_store: 'qdrant-store',
  qd_find: 'qdrant-find',
};

export const qdrantPlugin: MCPPlugin = {
  id: 'qdrant',
  name: 'Qdrant',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>, env?: Env) {
    return new QdrantClient({
      mcpUrl: env?.QDRANT_MCP_URL || 'https://qdrant-mcp.node2flow.net',
      authToken: env?.QDRANT_MCP_AUTH_TOKEN,
      qdrantUrl: config.qdrant_url as string,
      apiKey: config.api_key as string | undefined,
      collectionName: config.collection_name as string,
      embeddingModel: config.embedding_model as string | undefined,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const mcp = client as QdrantClient;

    try {
      const originalName = TOOL_NAME_MAP[toolName] || toolName;
      const result = await mcp.callTool(originalName, args);

      if (result && typeof result === 'object' && 'content' in (result as any)) {
        return {
          content: (result as any).content,
          isError: false,
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  },
};
