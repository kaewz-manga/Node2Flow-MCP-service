/**
 * cl-n8n-mcp Plugin Types
 */

export interface ClN8nMcpConfig {
  mcpUrl: string;           // cl-n8n-mcp server URL (e.g., https://cl-n8n-mcp.node2flow.net)
  authToken: string;        // Auth token (n2f_ API key or AUTH_TOKEN)
  n8nUrl?: string;          // Optional n8n instance URL for management tools
  n8nApiKey?: string;       // Optional n8n API key for management tools
}
