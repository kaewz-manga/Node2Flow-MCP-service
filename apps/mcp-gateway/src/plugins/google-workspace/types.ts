export interface GoogleWorkspaceConfig {
  mcpUrl: string;
  authToken?: string;
  serviceAccountJson?: string;  // User's service account JSON (passed per-request via header)
  oauthToken?: string;          // User's Google OAuth token (passed per-request via header)
}
