export interface NotionOfficialConfig {
  mcpUrl: string;
  authToken?: string;
  notionToken?: string;  // User's Notion Integration Token (passed per-request via header)
}
