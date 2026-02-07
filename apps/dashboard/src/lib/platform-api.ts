/**
 * Platform Worker API Client
 * Auth, billing, admin, user management, API keys, feedback, usage
 */

import { platformRequest, setToken, getToken, type ApiResponse } from '@node2flow/dashboard-core';

// ============================================
// Types
// ============================================

export interface Usage {
  plan: string;
  period: string;
  requests: {
    used: number;
    limit: number;
    remaining: number;
    unlimited?: boolean;
  };
  rate_limit?: {
    used: number;
    limit: number;
    remaining: number;
    unlimited?: boolean;
  };
  monthly?: {
    period: string;
    used: number;
    success_count: number;
    error_count: number;
  };
  connections: {
    used: number;
    limit: number;
  };
  success_rate: number;
  reset_at: string;
}

export interface Plan {
  id: string;
  name: string;
  daily_request_limit: number;
  requests_per_minute: number;
  monthly_request_limit: number;
  max_connections: number;
  price_monthly: number;
  features: Record<string, any>;
}

export interface PlatformStats {
  total_users: number;
  total_executions: number;
  total_successes: number;
  pass_rate: number;
}

export interface ApiKeyInfo {
  id: string;
  prefix: string;
  name: string;
  status: string;
  connection_id: string;
  last_used_at: string | null;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_requests_today: number;
  error_rate_today: number;
  mrr: number;
}

export interface AdminUser {
  id: string;
  email: string;
  plan: string;
  status: string;
  is_admin: number;
  stripe_customer_id: string | null;
  oauth_provider: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageTimeseries {
  date: string;
  requests: number;
  errors: number;
}

export interface TopTool {
  tool_name: string;
  count: number;
  error_count: number;
  avg_response_ms: number;
}

export interface TopUser {
  user_id: string;
  email: string;
  request_count: number;
}

export interface PlanDist {
  plan: string;
  count: number;
  price_monthly: number;
}

export interface ErrorLog {
  id: string;
  user_id: string;
  email: string;
  tool_name: string;
  error_message: string;
  response_time_ms: number;
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  user_id: string;
  category: 'bug' | 'feature' | 'general' | 'question';
  message: string;
  status: 'new' | 'reviewed' | 'resolved' | 'archived';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminFeedbackItem extends FeedbackItem {
  user_email: string;
}

export interface TOTPSetupData {
  secret: string;
  uri: string;
  qr_code_url: string;
  message: string;
}

export interface MaintenanceState {
  enabled: boolean;
  enabled_by: string | null;
  enabled_at: string | null;
  message: string | null;
}

// ============================================
// User Management
// ============================================

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<{ message: string }>> {
  return platformRequest('/api/user/password', {
    method: 'PUT',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export async function deleteAccount(
  password?: string,
  confirm?: boolean
): Promise<ApiResponse<{ message: string }>> {
  return platformRequest('/api/user', {
    method: 'DELETE',
    body: JSON.stringify({ password, confirm }),
  });
}

export async function forceDeleteAccount(
  password?: string,
  confirm?: boolean
): Promise<ApiResponse<{ message: string }>> {
  return platformRequest('/api/user/force-delete', {
    method: 'POST',
    body: JSON.stringify({ password, confirm }),
  });
}

export async function updateSessionDuration(
  duration: number
): Promise<ApiResponse<{ message: string; token: string; duration: number }>> {
  const response = await platformRequest<{ message: string; token: string; duration: number }>(
    '/api/user/session-duration',
    { method: 'PUT', body: JSON.stringify({ duration }) }
  );
  if (response.success && response.data?.token) {
    setToken(response.data.token);
  }
  return response;
}

export async function exportUserData(format: 'json' | 'csv'): Promise<Blob> {
  const token = getToken();
  const config = { platformUrl: import.meta.env.VITE_PLATFORM_URL || 'http://localhost:8787' };
  const response = await fetch(`${config.platformUrl}/api/user/export?format=${format}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Export failed' } }));
    throw new Error(error.error?.message || 'Export failed');
  }
  return response.blob();
}

export async function recoverAccount(): Promise<ApiResponse<{ message: string }>> {
  return platformRequest('/api/user/recover', { method: 'POST' });
}

// ============================================
// Usage & Plans
// ============================================

export async function getUsage(): Promise<ApiResponse<Usage>> {
  return platformRequest('/api/usage');
}

export async function getPlans(): Promise<ApiResponse<{ plans: Plan[] }>> {
  return platformRequest('/api/plans');
}

export async function getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
  return platformRequest('/api/platform-stats');
}

// ============================================
// Billing
// ============================================

export async function createCheckoutSession(
  planId: string
): Promise<ApiResponse<{ url: string; session_id: string }>> {
  return platformRequest('/api/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId }),
  });
}

export async function createBillingPortalSession(): Promise<ApiResponse<{ url: string }>> {
  return platformRequest('/api/billing/portal', { method: 'POST' });
}

// ============================================
// TOTP
// ============================================

export async function setupTOTP(): Promise<ApiResponse<TOTPSetupData>> {
  return platformRequest('/api/auth/totp/setup', { method: 'POST' });
}

export async function enableTOTP(code: string): Promise<ApiResponse<{ message: string }>> {
  return platformRequest('/api/auth/totp/enable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function getTOTPStatus(): Promise<ApiResponse<{ enabled: boolean }>> {
  return platformRequest('/api/auth/totp/status');
}

export async function disableTOTP(password?: string): Promise<ApiResponse<{ message: string }>> {
  return platformRequest('/api/auth/totp/disable', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

// ============================================
// API Keys (Platform Worker, references Gateway connection_id)
// ============================================

export async function getApiKeys(): Promise<ApiResponse<{ api_keys: ApiKeyInfo[] }>> {
  return platformRequest('/api/api-keys');
}

export async function createApiKey(
  connectionId: string,
  name?: string
): Promise<ApiResponse<{ api_key: string; prefix: string; message: string }>> {
  return platformRequest('/api/api-keys', {
    method: 'POST',
    body: JSON.stringify({ connection_id: connectionId, name }),
  });
}

export async function revokeApiKey(id: string): Promise<ApiResponse<{ message: string }>> {
  return platformRequest(`/api/api-keys/${id}`, { method: 'DELETE' });
}

// ============================================
// Feedback
// ============================================

export async function getUserFeedback(): Promise<ApiResponse<{ feedback: FeedbackItem[] }>> {
  return platformRequest('/api/feedback');
}

// ============================================
// Admin
// ============================================

export async function getAdminStats(): Promise<ApiResponse<AdminStats>> {
  return platformRequest('/api/admin/stats');
}

export async function getAdminUsers(params: {
  limit?: number;
  offset?: number;
  plan?: string;
  status?: string;
  search?: string;
}): Promise<ApiResponse<{ users: AdminUser[]; total: number }>> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.offset) qs.set('offset', String(params.offset));
  if (params.plan) qs.set('plan', params.plan);
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  return platformRequest(`/api/admin/users?${qs.toString()}`);
}

export async function getAdminUser(id: string): Promise<ApiResponse<any>> {
  return platformRequest(`/api/admin/users/${id}`);
}

export async function updateAdminUserPlan(id: string, plan: string): Promise<ApiResponse<any>> {
  return platformRequest(`/api/admin/users/${id}/plan`, { method: 'PUT', body: JSON.stringify({ plan }) });
}

export async function updateAdminUserStatus(id: string, status: string): Promise<ApiResponse<any>> {
  return platformRequest(`/api/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
}

export async function deleteAdminUser(id: string): Promise<ApiResponse<any>> {
  return platformRequest(`/api/admin/users/${id}`, { method: 'DELETE' });
}

// ============================================
// Admin Analytics
// ============================================

export async function getAdminUsageTimeseries(days?: number): Promise<ApiResponse<{ timeseries: UsageTimeseries[] }>> {
  return platformRequest(`/api/admin/analytics/usage${days ? `?days=${days}` : ''}`);
}

export async function getAdminTopTools(days?: number, product?: string): Promise<ApiResponse<{ tools: TopTool[] }>> {
  const params = new URLSearchParams();
  if (days) params.set('days', String(days));
  if (product) params.set('product', product);
  const qs = params.toString();
  return platformRequest(`/api/admin/analytics/tools${qs ? `?${qs}` : ''}`);
}

export interface ProductUsage {
  product: string;
  requests: number;
  errors: number;
  avg_response_ms: number;
}

export async function getAdminUsageByProduct(days?: number): Promise<ApiResponse<{ products: ProductUsage[] }>> {
  return platformRequest(`/api/admin/analytics/by-product${days ? `?days=${days}` : ''}`);
}

export async function getAdminTopUsers(days?: number): Promise<ApiResponse<{ users: TopUser[] }>> {
  return platformRequest(`/api/admin/analytics/top-users${days ? `?days=${days}` : ''}`);
}

export async function getAdminRevenueOverview(): Promise<ApiResponse<{ mrr: number; plan_distribution: PlanDist[] }>> {
  return platformRequest('/api/admin/revenue/overview');
}

export async function getAdminErrors(limit?: number): Promise<ApiResponse<{ errors: ErrorLog[] }>> {
  return platformRequest(`/api/admin/health/errors${limit ? `?limit=${limit}` : ''}`);
}

export async function getAdminErrorTrend(days?: number): Promise<ApiResponse<{ trend: { date: string; count: number }[] }>> {
  return platformRequest(`/api/admin/health/error-trend${days ? `?days=${days}` : ''}`);
}

// ============================================
// Admin Feedback
// ============================================

export async function getAdminFeedback(params: {
  limit?: number;
  offset?: number;
  status?: string;
  category?: string;
}): Promise<ApiResponse<{ feedback: AdminFeedbackItem[]; total: number }>> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.offset) qs.set('offset', String(params.offset));
  if (params.status) qs.set('status', params.status);
  if (params.category) qs.set('category', params.category);
  return platformRequest(`/api/admin/feedback?${qs.toString()}`);
}

export async function updateAdminFeedback(
  id: string,
  data: { status?: string; admin_notes?: string }
): Promise<ApiResponse<{ message: string }>> {
  return platformRequest(`/api/admin/feedback/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============================================
// Admin System Controls
// ============================================

export async function adminRecalculateStats(
  confirmation: string
): Promise<ApiResponse<any>> {
  return platformRequest('/api/admin/system/recalculate-stats', {
    method: 'POST',
    body: JSON.stringify({ confirmation }),
  });
}

export async function adminClearLogs(
  confirmation: string
): Promise<ApiResponse<{ message: string; usage_logs_deleted: number; usage_monthly_deleted: number }>> {
  return platformRequest('/api/admin/system/clear-logs', {
    method: 'POST',
    body: JSON.stringify({ confirmation }),
  });
}

export async function adminFullReset(
  confirmation: string
): Promise<ApiResponse<any>> {
  return platformRequest('/api/admin/system/full-reset', {
    method: 'POST',
    body: JSON.stringify({ confirmation }),
  });
}

export async function getMaintenanceMode(): Promise<ApiResponse<MaintenanceState>> {
  return platformRequest('/api/admin/system/maintenance');
}

export async function setMaintenanceMode(
  enabled: boolean,
  message?: string
): Promise<ApiResponse<MaintenanceState & { status_message: string }>> {
  return platformRequest('/api/admin/system/maintenance', {
    method: 'POST',
    body: JSON.stringify({ enabled, message }),
  });
}
