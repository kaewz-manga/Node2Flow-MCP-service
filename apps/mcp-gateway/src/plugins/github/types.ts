/**
 * GitHub MCP Server - Type Definitions
 */

export interface GitHubConfig {
  token: string;       // GitHub PAT
  apiUrl?: string;     // default: https://api.github.com
}
