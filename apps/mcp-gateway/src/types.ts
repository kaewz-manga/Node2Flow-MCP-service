// MCP Gateway Types

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface MCPToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export interface MCPPlugin {
  /** Plugin identifier, e.g. 'n8n', 'wordpress', 'make' */
  id: string;
  /** Display name, e.g. 'n8n Workflow Manager' */
  name: string;
  /** Semver version */
  version: string;
  /** MCP tool definitions for this plugin */
  tools: MCPToolDefinition[];
  /** Create a client from decrypted connection config */
  createClient(config: Record<string, unknown>): unknown;
  /** Execute a tool call */
  handleToolCall(
    toolName: string,
    args: Record<string, unknown>,
    client: unknown
  ): Promise<MCPToolResult>;
}

export interface Connection {
  id: string;
  user_id: string;
  product_type: string;
  name: string;
  config_encrypted: string;
  status: 'active' | 'inactive' | 'error';
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Env {
  DB: D1Database;
  PLATFORM: Fetcher;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
}
