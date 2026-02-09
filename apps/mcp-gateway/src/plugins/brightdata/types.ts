/**
 * Brightdata MCP Plugin Types
 */

export interface BrightdataConfig {
  apiToken: string;           // Bright Data API token (required)
  mcpUrl?: string;            // Custom MCP server URL (default: https://mcp.brightdata.com)
  proMode?: boolean;          // Enable pro mode with 60+ tools
  browserZone?: string;       // Custom browser zone name
  webUnlockerZone?: string;   // Custom web unlocker zone name
}
