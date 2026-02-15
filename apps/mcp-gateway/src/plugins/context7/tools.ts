/**
 * Context7 MCP Tool Definitions (2 tools)
 * Source: @upstash/context7-mcp v2.1.1
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  {
    name: 'context7_resolve_library_id',
    description: 'Resolves a package/product name to a Context7-compatible library ID. Call this before query_docs to obtain a valid library ID. Returns matching libraries ranked by name similarity, description relevance, code snippet count, source reputation, and benchmark score.',
    annotations: {
      title: 'Resolve Library ID',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The question or task for ranking results by relevance' },
        libraryName: { type: 'string', description: 'Library name to search for (e.g. "react", "express", "next.js")' },
      },
      required: ['query', 'libraryName'],
    },
  },
  {
    name: 'context7_query_docs',
    description: 'Retrieves up-to-date documentation and code examples from Context7 for any programming library or framework. Call resolve_library_id first to obtain the library ID, unless the user provides one directly in /org/project format.',
    annotations: {
      title: 'Query Documentation',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        libraryId: { type: 'string', description: 'Context7-compatible library ID (e.g. "/mongodb/docs", "/vercel/next.js")' },
        query: { type: 'string', description: 'Specific question or task (e.g. "How to set up JWT authentication in Express.js")' },
      },
      required: ['libraryId', 'query'],
    },
  },
];
