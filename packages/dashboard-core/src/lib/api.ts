/**
 * @node2flow/dashboard-core API Layer
 *
 * Configurable API client that supports split Platform + Gateway Workers.
 * Call configureApi() at app init before any React rendering.
 */

// ============================================
// Types
// ============================================

export interface User {
  id: string;
  email: string;
  plan: string;
  status: string;
  is_admin?: number;
  session_duration_seconds?: number;
  created_at: string;
  oauth_provider?: string | null;
  scheduled_deletion_at?: string | null;
}

export interface Connection {
  id: string;
  user_id: string;
  product_type: string;
  name: string;
  status: string;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    request_id: string;
    timestamp: string;
  };
}

export interface OAuthProvider {
  id: 'github' | 'google';
  name: string;
  enabled: boolean;
}

export interface SudoStatus {
  active: boolean;
  expires_at?: string;
  totp_enabled?: boolean;
}

// ============================================
// API Configuration
// ============================================

export interface ApiConfig {
  platformUrl: string;
  gatewayUrl: string;
}

let _config: ApiConfig = {
  platformUrl: '',
  gatewayUrl: '',
};

export function configureApi(config: ApiConfig): void {
  _config = config;
}

export function getApiConfig(): ApiConfig {
  return _config;
}

// ============================================
// Token Management
// ============================================

const TOKEN_KEY = 'n2f_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ============================================
// Base Request Helpers
// ============================================

async function baseRequest<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && token) {
        // Only redirect to login if user had a token (expired/invalid session)
        // Don't redirect for unauthenticated API calls from public pages
        clearToken();
        window.location.href = '/login';
      }
      return data as ApiResponse<T>;
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      },
    };
  }
}

export async function platformRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return baseRequest<T>(_config.platformUrl, endpoint, options);
}

export async function gatewayRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return baseRequest<T>(_config.gatewayUrl, endpoint, options);
}

// ============================================
// Auth API (used by Login.tsx, Register.tsx)
// ============================================

export async function register(
  email: string,
  password: string
): Promise<ApiResponse<{ user: User }>> {
  return platformRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<{ token: string; user: User }>> {
  const response = await platformRequest<{ token: string; user: User }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  );

  if (response.success && response.data?.token) {
    setToken(response.data.token);
  }

  return response;
}

export function logout(): void {
  clearToken();
  window.location.href = '/login';
}

export async function getOAuthProviders(): Promise<
  ApiResponse<{ providers: OAuthProvider[] }>
> {
  return platformRequest('/api/auth/oauth/providers');
}

export async function getOAuthUrl(
  provider: 'github' | 'google'
): Promise<ApiResponse<{ url: string; state: string }>> {
  return platformRequest(`/api/auth/oauth/${provider}`);
}

export function handleOAuthToken(token: string): void {
  setToken(token);
}

// ============================================
// User Profile (used by AuthContext)
// ============================================

export async function getProfile(): Promise<ApiResponse<User>> {
  return platformRequest('/api/user/profile');
}

// ============================================
// Connections (used by ConnectionContext) → Gateway Worker
// ============================================

export async function getConnections(
  productType?: string
): Promise<ApiResponse<{ connections: Connection[] }>> {
  const qs = productType ? `?product_type=${productType}` : '';
  return gatewayRequest(`/api/connections${qs}`);
}

// ============================================
// Sudo (used by useSudo hook)
// ============================================

export async function getSudoStatus(): Promise<ApiResponse<SudoStatus>> {
  return platformRequest('/api/auth/sudo-status');
}

export async function verifySudoTOTP(
  code: string
): Promise<ApiResponse<{ message: string; expires_at: string }>> {
  return platformRequest('/api/auth/verify-sudo', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

// ============================================
// Feedback (used by FeedbackBubble)
// ============================================

export async function submitFeedback(
  category: string,
  message: string
): Promise<ApiResponse<{ feedback: any }>> {
  return platformRequest('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({ category, message }),
  });
}
