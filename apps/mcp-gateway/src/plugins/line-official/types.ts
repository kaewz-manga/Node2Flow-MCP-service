export interface LineOfficialConfig {
  mcpUrl: string;
  authToken?: string;
  channelAccessToken?: string;  // User's LINE Channel Access Token (passed per-request via header)
  destinationUserId?: string;   // User's default destination user ID (passed per-request via header)
}
