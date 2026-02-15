/**
 * Supabase MCP — Type definitions
 */

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export interface ManagementConfig {
  accessToken: string;
}

export interface FullConfig {
  url?: string;
  serviceRoleKey?: string;
  accessToken?: string;
}
