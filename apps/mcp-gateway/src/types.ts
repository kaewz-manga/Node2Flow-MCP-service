// MCP Gateway Types

export interface MCPToolDefinition {
  name: string;
  description: string;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
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
  /** Create a client from decrypted connection config + optional Worker env */
  createClient(config: Record<string, unknown>, env?: Env): unknown;
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
  OAUTH_KV: KVNamespace;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  CL_N8N_MCP_URL?: string;
  CL_N8N_MCP_AUTH_TOKEN?: string;
  NOTION_OFFICIAL_MCP_AUTH_TOKEN?: string;
  LINE_OFFICIAL_MCP_AUTH_TOKEN?: string;
  PLAYWRIGHT_MCP_AUTH_TOKEN?: string;
  GOOGLE_WORKSPACE_MCP_AUTH_TOKEN?: string;
  NOTION_OFFICIAL_MCP_URL?: string;
  LINE_OFFICIAL_MCP_URL?: string;
  PLAYWRIGHT_MCP_URL?: string;
  GOOGLE_WORKSPACE_MCP_URL?: string;
  DASHBOARD_URL?: string;
}

export interface AuthResult {
  userId: string;
  email: string;
  plan: string;
  connectionId: string | null;      // null for OAuth JWT auth or '_all' scoped keys
  productType: string | null;       // null for OAuth JWT auth or '_all' scoped keys
  config: Record<string, unknown> | null;  // null for OAuth JWT auth or '_all' scoped keys
  apiKeyId: string;                 // 'oauth' for JWT auth
  usage: { current: number; limit: number; remaining: number };
  authMethod: 'api_key' | 'oauth';
  scope: { plugins?: string[]; permissions?: string[] } | null;  // null = full access
}
