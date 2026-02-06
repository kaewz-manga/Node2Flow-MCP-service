/**
 * Auth Routes: Register, Login, OAuth, TOTP, Sudo
 */

import type { Env } from '../types';
import { apiResponse } from '../helpers';
import {
  handleRegister,
  handleLogin,
  verifyAuthToken,
  verifySudoTOTP,
  hasSudoSession,
  setupTOTP,
  verifyTOTPSetup,
  disableTOTP,
  getTOTPStatus,
  getOAuthAuthorizeUrl,
  handleOAuthCallback,
  generateOAuthState,
  validateOAuthState,
  getUserById,
  getAllPlans,
  getPlatformStats,
  incrementPlatformStat,
  sendEmail,
  welcomeEmail,
  verifyPassword,
} from '@node2flow/platform-core';

export async function handleAuthRoutes(
  request: Request,
  env: Env,
  path: string,
  ctx: ExecutionContext
): Promise<Response | null> {
  const method = request.method;

  // POST /api/auth/register
  if (path === '/api/auth/register' && method === 'POST') {
    const body = await request.json() as { email: string; password: string };
    const result = await handleRegister(env.DB, body.email, body.password);
    if (result.success && body.email) {
      ctx.waitUntil(sendEmail(env as any, welcomeEmail(body.email)));
      ctx.waitUntil(incrementPlatformStat(env.DB, 'total_users'));
    }
    return apiResponse(result, result.success ? 201 : 400);
  }

  // POST /api/auth/login
  if (path === '/api/auth/login' && method === 'POST') {
    const body = await request.json() as { email: string; password: string };
    const result = await handleLogin(env.DB, env.JWT_SECRET, body.email, body.password);
    return apiResponse(result, result.success ? 200 : 401);
  }

  // GET /api/auth/oauth/providers
  if (path === '/api/auth/oauth/providers' && method === 'GET') {
    return apiResponse({
      success: true,
      data: {
        providers: [
          { id: 'github', name: 'GitHub', enabled: !!env.GITHUB_CLIENT_ID },
          { id: 'google', name: 'Google', enabled: !!env.GOOGLE_CLIENT_ID },
        ].filter(p => p.enabled),
      },
    });
  }

  // GET /api/auth/oauth/:provider
  const oauthInitMatch = path.match(/^\/api\/auth\/oauth\/(github|google)$/);
  if (oauthInitMatch && method === 'GET') {
    const provider = oauthInitMatch[1] as 'github' | 'google';
    const url = new URL(request.url);
    const redirectUri = url.searchParams.get('redirect_uri') || `${url.origin}/api/auth/oauth/${provider}/callback`;

    if (provider === 'github' && !env.GITHUB_CLIENT_ID) {
      return apiResponse({ success: false, error: { code: 'PROVIDER_NOT_CONFIGURED', message: 'GitHub OAuth is not configured' } }, 400);
    }
    if (provider === 'google' && !env.GOOGLE_CLIENT_ID) {
      return apiResponse({ success: false, error: { code: 'PROVIDER_NOT_CONFIGURED', message: 'Google OAuth is not configured' } }, 400);
    }

    const state = await generateOAuthState(env.OAUTH_STATE_KV);
    await env.OAUTH_STATE_KV.put(`oauth_redirect:${state}`, redirectUri, { expirationTtl: 600 });
    const authorizeUrl = getOAuthAuthorizeUrl(provider, env as any, redirectUri, state);

    return apiResponse({ success: true, data: { url: authorizeUrl, state } });
  }

  // GET /api/auth/oauth/:provider/callback
  const oauthCallbackMatch = path.match(/^\/api\/auth\/oauth\/(github|google)\/callback$/);
  if (oauthCallbackMatch && method === 'GET') {
    const provider = oauthCallbackMatch[1] as 'github' | 'google';
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      const errorDesc = url.searchParams.get('error_description') || error;
      const frontendUrl = env.APP_URL || url.origin;
      return Response.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorDesc)}`, 302);
    }

    if (!code || !state) {
      return apiResponse({ success: false, error: { code: 'INVALID_REQUEST', message: 'Missing code or state parameter' } }, 400);
    }

    const validState = await validateOAuthState(env.OAUTH_STATE_KV, state);
    if (!validState) {
      return apiResponse({ success: false, error: { code: 'INVALID_STATE', message: 'Invalid or expired state parameter' } }, 400);
    }

    const redirectUri = await env.OAUTH_STATE_KV.get(`oauth_redirect:${state}`) || `${url.origin}/api/auth/oauth/${provider}/callback`;
    await env.OAUTH_STATE_KV.delete(`oauth_redirect:${state}`);

    const result = await handleOAuthCallback(provider, env as any, code, redirectUri);

    if (result.success && result.data) {
      if (result.data.isNewUser) {
        ctx.waitUntil(sendEmail(env as any, welcomeEmail(result.data.user.email)));
        ctx.waitUntil(incrementPlatformStat(env.DB, 'total_users'));
      }
      const frontendUrl = env.APP_URL || url.origin;
      return Response.redirect(`${frontendUrl}/auth/callback?token=${result.data.token}&email=${encodeURIComponent(result.data.user.email)}`, 302);
    } else {
      const frontendUrl = env.APP_URL || url.origin;
      return Response.redirect(`${frontendUrl}/login?error=${encodeURIComponent(result.error?.message || 'OAuth failed')}`, 302);
    }
  }

  // POST /api/auth/verify-sudo
  if (path === '/api/auth/verify-sudo' && method === 'POST') {
    const authUser = await verifyAuthToken(request, env.JWT_SECRET);
    if (!authUser) {
      return apiResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    }

    const existingSudo = await hasSudoSession(env.RATE_LIMIT_KV, authUser.userId);
    if (existingSudo.active) {
      return apiResponse({ success: true, data: { message: 'Already verified', expires_at: existingSudo.expires_at } });
    }

    const body = await request.json() as { code?: string };
    if (!body.code || !/^\d{6}$/.test(body.code)) {
      return apiResponse({ success: false, error: { code: 'INVALID_CODE', message: 'Please enter a 6-digit code from your authenticator app' } }, 400);
    }

    const result = await verifySudoTOTP(env.DB, env.RATE_LIMIT_KV, env.ENCRYPTION_KEY, authUser.userId, body.code);
    if (!result.success) {
      return apiResponse({ success: false, error: { code: 'VERIFICATION_FAILED', message: result.error || 'Invalid verification code' } }, 400);
    }

    const sudoStatus = await hasSudoSession(env.RATE_LIMIT_KV, authUser.userId);
    return apiResponse({ success: true, data: { message: 'Verification successful', expires_at: sudoStatus.expires_at } });
  }

  // GET /api/auth/sudo-status
  if (path === '/api/auth/sudo-status' && method === 'GET') {
    const authUser = await verifyAuthToken(request, env.JWT_SECRET);
    if (!authUser) {
      return apiResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    }
    const [sudoStatus, totpStatus] = await Promise.all([
      hasSudoSession(env.RATE_LIMIT_KV, authUser.userId),
      getTOTPStatus(env.DB, authUser.userId),
    ]);
    return apiResponse({ success: true, data: { ...sudoStatus, totp_enabled: totpStatus.enabled } });
  }

  // POST /api/auth/totp/setup
  if (path === '/api/auth/totp/setup' && method === 'POST') {
    const authUser = await verifyAuthToken(request, env.JWT_SECRET);
    if (!authUser) {
      return apiResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    }
    const totpStatus = await getTOTPStatus(env.DB, authUser.userId);
    if (totpStatus.enabled) {
      return apiResponse({ success: false, error: { code: 'ALREADY_ENABLED', message: 'TOTP is already enabled. Disable it first to set up again.' } }, 400);
    }
    const result = await setupTOTP(env.RATE_LIMIT_KV, env.ENCRYPTION_KEY, authUser.userId, authUser.email);
    return apiResponse({ success: true, data: { secret: result.secret, uri: result.uri, qr_code_url: result.qrCodeUrl, message: 'Scan the QR code with your authenticator app, then verify with a code' } });
  }

  // POST /api/auth/totp/enable
  if (path === '/api/auth/totp/enable' && method === 'POST') {
    const authUser = await verifyAuthToken(request, env.JWT_SECRET);
    if (!authUser) {
      return apiResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    }
    const body = await request.json() as { code?: string };
    if (!body.code || !/^\d{6}$/.test(body.code)) {
      return apiResponse({ success: false, error: { code: 'INVALID_CODE', message: 'Please enter a 6-digit code from your authenticator app' } }, 400);
    }
    const result = await verifyTOTPSetup(env.DB, env.RATE_LIMIT_KV, env.ENCRYPTION_KEY, authUser.userId, body.code);
    if (!result.success) {
      return apiResponse({ success: false, error: { code: 'VERIFICATION_FAILED', message: result.error || 'Invalid code' } }, 400);
    }
    return apiResponse({ success: true, data: { message: 'TOTP enabled successfully.' } });
  }

  // GET /api/auth/totp/status
  if (path === '/api/auth/totp/status' && method === 'GET') {
    const authUser = await verifyAuthToken(request, env.JWT_SECRET);
    if (!authUser) {
      return apiResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    }
    const totpStatus = await getTOTPStatus(env.DB, authUser.userId);
    return apiResponse({ success: true, data: { enabled: totpStatus.enabled } });
  }

  // POST /api/auth/totp/disable
  if (path === '/api/auth/totp/disable' && method === 'POST') {
    const authUser = await verifyAuthToken(request, env.JWT_SECRET);
    if (!authUser) {
      return apiResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    }
    const body = await request.json() as { password?: string };
    const user = await getUserById(env.DB, authUser.userId);
    if (!user) {
      return apiResponse({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } }, 404);
    }
    if (user.password_hash) {
      if (!body.password) {
        return apiResponse({ success: false, error: { code: 'PASSWORD_REQUIRED', message: 'Password is required to disable TOTP' } }, 400);
      }
      const validPassword = await verifyPassword(body.password, user.password_hash);
      if (!validPassword) {
        return apiResponse({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Invalid password' } }, 401);
      }
    } else {
      const sudoStatus = await hasSudoSession(env.RATE_LIMIT_KV, authUser.userId);
      if (!sudoStatus.active) {
        return apiResponse({ success: false, error: { code: 'SUDO_REQUIRED', message: 'Security verification required' } }, 403);
      }
    }
    await disableTOTP(env.DB, authUser.userId);
    return apiResponse({ success: true, data: { message: 'TOTP disabled successfully' } });
  }

  // GET /api/plans (public)
  if (path === '/api/plans' && method === 'GET') {
    const plans = await getAllPlans(env.DB);
    return apiResponse({
      success: true,
      data: {
        plans: plans.map((p: any) => ({
          id: p.id, name: p.name, daily_request_limit: p.daily_request_limit ?? -1,
          requests_per_minute: p.requests_per_minute ?? 50, monthly_request_limit: p.monthly_request_limit,
          max_connections: p.max_connections, price_monthly: p.price_monthly,
          features: JSON.parse(p.features || '{}'),
        })),
      },
    });
  }

  // GET /api/platform-stats (public)
  if (path === '/api/platform-stats' && method === 'GET') {
    const stats = await getPlatformStats(env.DB);
    return apiResponse({ success: true, data: stats });
  }

  return null; // Not handled
}
