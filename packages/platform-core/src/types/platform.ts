/**
 * Platform Core - Type Definitions
 * Extracted from n8n-management-mcp/src/saas-types.ts
 */

// ============================================
// Database Entities
// ============================================

export interface User {
  id: string;
  email: string;
  password_hash: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'deleted' | 'pending_deletion';
  stripe_customer_id: string | null;
  session_duration_seconds: number;
  is_admin?: number;
  oauth_provider?: string;
  oauth_id?: string;
  totp_enabled?: number;
  totp_secret_encrypted?: string | null;
  scheduled_deletion_at?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  connection_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  scope: string | null;
  status: 'active' | 'revoked';
  last_used_at: string | null;
  created_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  api_key_id: string;
  connection_id: string;
  tool_name: string;
  status: 'success' | 'error' | 'rate_limited';
  response_time_ms: number | null;
  error_message: string | null;
  created_at: string;
}

export interface UsageMonthly {
  id: string;
  user_id: string;
  year_month: string;
  request_count: number;
  success_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  daily_request_limit: number;
  requests_per_minute: number;
  monthly_request_limit: number;
  max_connections: number;
  price_monthly: number;
  features: string;
  is_active: number;
  created_at: string;
}

export interface AiConnection {
  id: string;
  user_id: string;
  name: string;
  provider_url: string;
  api_key_encrypted: string;
  model_name: string;
  is_default: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface BotConnection {
  id: string;
  user_id: string;
  platform: 'telegram' | 'line';
  name: string;
  bot_token_encrypted: string;
  channel_secret_encrypted: string | null;
  ai_connection_id: string;
  mcp_api_key_encrypted: string;
  webhook_active: number;
  webhook_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  category: 'bug' | 'feature' | 'general' | 'question';
  message: string;
  status: 'new' | 'reviewed' | 'resolved' | 'archived';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    plan: string;
  };
  error?: string;
}

export interface UsageResponse {
  plan: string;
  limit: number;
  used: number;
  remaining: number;
  reset_at: string;
  connections: number;
  max_connections: number;
}

// ============================================
// Auth Context (passed through middleware)
// ============================================

export interface AuthContext {
  user: {
    id: string;
    email: string;
    plan: 'free' | 'pro' | 'enterprise';
  };
  connection: {
    id: string;
    config: Record<string, unknown>; // Product-specific config (decrypted)
  };
  apiKey: {
    id: string;
  };
  usage: {
    current: number;
    limit: number;
    remaining: number;
  };
}

// ============================================
// API Response Wrapper
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    request_id: string;
    timestamp: string;
  };
}

// ============================================
// Rate Limit Info
// ============================================

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
}

// ============================================
// Cloudflare Workers Environment
// ============================================

export interface PlatformEnv {
  DB: D1Database;
  RATE_LIMIT_KV: KVNamespace;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;

  // OAuth
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APP_URL?: string;

  // Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_STARTER?: string;
  STRIPE_PRICE_PRO?: string;
  STRIPE_PRICE_ENTERPRISE?: string;

  // Agent
  AGENT_SECRET?: string;
  AGENT_URL?: string;

  // Email
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;

  ENVIRONMENT?: 'development' | 'staging' | 'production';
}

// ============================================
// Data Export (GDPR)
// ============================================

export interface ExportData {
  export_date: string;
  user: {
    id: string;
    email: string;
    plan: string;
    status: string;
    oauth_provider: string | null;
    created_at: string;
  };
  connections: Array<{
    id: string;
    name: string;
    product_type: string;
    status: string;
    created_at: string;
    api_keys: Array<{
      id: string;
      key_prefix: string;
      name: string;
      status: string;
      last_used_at: string | null;
      created_at: string;
    }>;
  }>;
  usage_monthly: Array<{
    year_month: string;
    request_count: number;
    success_count: number;
    error_count: number;
  }>;
  ai_connections: Array<{
    id: string;
    name: string;
    provider_url: string;
    model_name: string;
    status: string;
    created_at: string;
  }>;
  bot_connections: Array<{
    id: string;
    platform: string;
    name: string;
    webhook_url: string | null;
    status: string;
    created_at: string;
  }>;
}

// ============================================
// Maintenance Mode
// ============================================

export interface MaintenanceState {
  enabled: boolean;
  enabled_by: string | null;
  enabled_at: string | null;
  message: string | null;
}
