// Platform shared types
// TODO: Phase 2 - Extract from n8n-management-mcp/src/saas-types.ts

export interface PlatformUser {
  id: string;
  email: string;
  plan: string;
  status: string;
  is_admin: number;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  daily_request_limit: number;
  requests_per_minute: number;
  max_connections: number;
  price_monthly: number;
  features: string;
  is_active: number;
}

export interface AuthContext {
  userId: string;
  email: string;
  plan: string;
  isAdmin: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
