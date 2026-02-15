/**
 * cl-n8n-mcp Plugin Types
 */

export interface ClN8nMcpConfig {
  mcpUrl: string;           // cl-n8n-mcp server URL (e.g., https://n8n-mcp-dynamic.node2flow.net)
  n8nUrl?: string;          // n8n instance URL from user connection config
  n8nApiKey?: string;       // n8n API key from user connection config
}
