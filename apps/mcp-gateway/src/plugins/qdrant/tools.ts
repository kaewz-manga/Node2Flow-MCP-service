import type { MCPToolDefinition } from '../../types';

/**
 * Tool definitions from mcp-server-qdrant
 * Prefixed with qd_ to namespace within the gateway
 */
export const TOOLS: MCPToolDefinition[] = [
  {
    name: 'qd_store',
    description: 'Store information in Qdrant vector database with automatic embedding generation. Use this to save knowledge, notes, code snippets, or any text for later semantic retrieval.',
    inputSchema: {
      type: 'object',
      properties: {
        information: {
          type: 'string',
          description: 'The text content to embed and store in the vector database',
        },
        metadata: {
          type: 'object',
          description: 'Optional key-value metadata to attach to the stored entry (e.g., { "source": "docs", "code": "..." })',
        },
        collection_name: {
          type: 'string',
          description: 'Override the default collection name for this operation',
        },
      },
      required: ['information'],
    },
    annotations: {
      title: 'Store in Qdrant',
      readOnlyHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'qd_find',
    description: 'Search for semantically similar information in Qdrant vector database. Returns the most relevant stored entries matching your natural language query.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query to find semantically similar stored information',
        },
        collection_name: {
          type: 'string',
          description: 'Override the default collection name for this search',
        },
      },
      required: ['query'],
    },
    annotations: {
      title: 'Search Qdrant',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
];
