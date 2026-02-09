/**
 * Cloudflare MCP Plugin Types
 */

export interface CloudflareConfig {
  apiToken: string;       // Cloudflare API token (Bearer auth)
  accountId?: string;     // Cloudflare account ID (used by some services)
}

/** Maps a Cloudflare MCP service name to its hosted endpoint */
export const SERVICE_ENDPOINTS: Record<string, string> = {
  docs: 'https://docs.mcp.cloudflare.com/mcp',
  bindings: 'https://bindings.mcp.cloudflare.com/mcp',
  builds: 'https://builds.mcp.cloudflare.com/mcp',
  observability: 'https://observability.mcp.cloudflare.com/mcp',
  radar: 'https://radar.mcp.cloudflare.com/mcp',
  containers: 'https://containers.mcp.cloudflare.com/mcp',
  browser: 'https://browser.mcp.cloudflare.com/mcp',
  logs: 'https://logs.mcp.cloudflare.com/mcp',
  'ai-gateway': 'https://ai-gateway.mcp.cloudflare.com/mcp',
  autorag: 'https://autorag.mcp.cloudflare.com/mcp',
  auditlogs: 'https://auditlogs.mcp.cloudflare.com/mcp',
  'dns-analytics': 'https://dns-analytics.mcp.cloudflare.com/mcp',
  dex: 'https://dex.mcp.cloudflare.com/mcp',
  casb: 'https://casb.mcp.cloudflare.com/mcp',
  graphql: 'https://graphql.mcp.cloudflare.com/mcp',
};
