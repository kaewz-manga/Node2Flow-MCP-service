/**
 * Google Workspace OAuth Routes
 * Allows users to connect their own Google account for Workspace API access
 * (Gmail, Drive, Calendar, Docs, Sheets)
 *
 * This is SEPARATE from the MCP OAuth flow in oauth.ts (which handles user authentication).
 * This flow stores Google API tokens in the connection's config_encrypted.
 */

import type { Env, Connection } from '../types';
import { decryptConfig, encryptConfig } from './connections';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GOOGLE_WORKSPACE_SCOPES = [
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets',
].join(' ');

const GATEWAY_ORIGIN = 'https://mcp.node2flow.net';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function randomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('').slice(0, length);
}

// ============================================
// OAuth Route Handler
// ============================================

export async function handleGoogleWorkspaceOAuth(
  request: Request,
  env: Env,
  path: string,
  userId: string | null,
  ctx: ExecutionContext
): Promise<Response | null> {
  const method = request.method;

  // -----------------------------------------
  // POST /api/oauth/google-workspace/start
  // Requires JWT auth — returns Google authorize URL
  // -----------------------------------------
  if (path === '/api/oauth/google-workspace/start' && method === 'POST') {
    if (!userId) return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Login required' } }, 401);

    const body = await request.json() as { connection_id: string };
    if (!body.connection_id) {
      return json({ success: false, error: { code: 'MISSING_FIELDS', message: 'connection_id required' } }, 400);
    }

    // Verify connection ownership
    const conn = await env.DB.prepare(
      'SELECT id, user_id, product_type FROM connections WHERE id = ? AND user_id = ? AND status = ?'
    ).bind(body.connection_id, userId, 'active').first<{ id: string; user_id: string; product_type: string }>();

    if (!conn) {
      return json({ success: false, error: { code: 'NOT_FOUND', message: 'Connection not found' } }, 404);
    }

    if (conn.product_type !== 'google-workspace') {
      return json({ success: false, error: { code: 'INVALID_PRODUCT', message: 'Connection is not Google Workspace' } }, 400);
    }

    // Create state token and store in KV
    const state = randomString(32);
    await env.OAUTH_KV.put(
      `gws_state:${state}`,
      JSON.stringify({
        connection_id: body.connection_id,
        user_id: userId,
      }),
      { expirationTtl: 600 } // 10 min
    );

    // Build Google OAuth URL
    const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
    googleUrl.searchParams.set('redirect_uri', `${GATEWAY_ORIGIN}/api/oauth/google-workspace/callback`);
    googleUrl.searchParams.set('response_type', 'code');
    googleUrl.searchParams.set('scope', GOOGLE_WORKSPACE_SCOPES);
    googleUrl.searchParams.set('state', state);
    googleUrl.searchParams.set('access_type', 'offline');
    googleUrl.searchParams.set('prompt', 'consent');

    return json({ success: true, data: { authorize_url: googleUrl.toString() } });
  }

  // -----------------------------------------
  // GET /api/oauth/google-workspace/callback
  // Public — Google redirects here after consent
  // -----------------------------------------
  if (path === '/api/oauth/google-workspace/callback' && method === 'GET') {
    const dashboardUrl = env.DASHBOARD_URL || 'https://app.node2flow.net';
    const redirectBase = `${dashboardUrl}/google-workspace/connections`;

    try {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        return Response.redirect(`${redirectBase}?google_error=${encodeURIComponent(error)}`, 302);
      }

      if (!code || !state) {
        return Response.redirect(`${redirectBase}?google_error=${encodeURIComponent('Missing code or state')}`, 302);
      }

      // Validate state from KV
      const stateData = await env.OAUTH_KV.get(`gws_state:${state}`, 'json') as {
        connection_id: string;
        user_id: string;
      } | null;

      if (!stateData) {
        return Response.redirect(`${redirectBase}?google_error=${encodeURIComponent('Invalid or expired state')}`, 302);
      }

      // Delete state synchronously (one-time use, prevents replay attacks)
      await env.OAUTH_KV.delete(`gws_state:${state}`);

      // Exchange code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${GATEWAY_ORIGIN}/api/oauth/google-workspace/callback`,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error('Google token exchange failed:', errText);
        return Response.redirect(`${redirectBase}?google_error=${encodeURIComponent('Token exchange failed')}`, 302);
      }

      const tokenData = await tokenRes.json() as {
        access_token: string;
        refresh_token?: string;
        expires_in: number;
        token_type: string;
      };

      // Get Google user email
      let googleEmail: string | null = null;
      try {
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (userRes.ok) {
          const userInfo = await userRes.json() as { email: string; verified_email: boolean };
          if (userInfo.verified_email) googleEmail = userInfo.email;
        }
      } catch (err) {
        console.error('Google userinfo error:', err);
      }

      // Read existing connection config, merge OAuth fields
      const conn = await env.DB.prepare(
        'SELECT config_encrypted FROM connections WHERE id = ? AND user_id = ?'
      ).bind(stateData.connection_id, stateData.user_id).first<{ config_encrypted: string }>();

      let existingConfig: Record<string, unknown> = {};
      if (conn?.config_encrypted) {
        try {
          existingConfig = await decryptConfig(conn.config_encrypted, env.ENCRYPTION_KEY);
        } catch {
          // Empty or corrupted config — start fresh
        }
      }

      const updatedConfig = {
        ...existingConfig,
        oauth_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || existingConfig.refresh_token,
        token_expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
        google_email: googleEmail,
      };

      const configEncrypted = await encryptConfig(updatedConfig, env.ENCRYPTION_KEY);
      await env.DB.prepare(
        'UPDATE connections SET config_encrypted = ?, updated_at = ? WHERE id = ?'
      ).bind(configEncrypted, new Date().toISOString(), stateData.connection_id).run();

      return Response.redirect(`${redirectBase}?google_connected=true`, 302);
    } catch (err) {
      console.error('Google Workspace OAuth callback error:', err);
      return Response.redirect(`${redirectBase}?google_error=${encodeURIComponent('Internal error')}`, 302);
    }
  }

  // -----------------------------------------
  // GET /api/oauth/google-workspace/status/:id
  // JWT auth — returns connection's Google OAuth status
  // -----------------------------------------
  const statusMatch = path.match(/^\/api\/oauth\/google-workspace\/status\/([^/]+)$/);
  if (statusMatch && method === 'GET') {
    if (!userId) return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Login required' } }, 401);

    const connectionId = statusMatch[1];
    const conn = await env.DB.prepare(
      'SELECT config_encrypted FROM connections WHERE id = ? AND user_id = ? AND status = ?'
    ).bind(connectionId, userId, 'active').first<{ config_encrypted: string }>();

    if (!conn) {
      return json({ success: false, error: { code: 'NOT_FOUND', message: 'Connection not found' } }, 404);
    }

    let config: Record<string, unknown> = {};
    try {
      config = await decryptConfig(conn.config_encrypted, env.ENCRYPTION_KEY);
    } catch {
      // Empty config
    }

    const connected = !!config.oauth_token;
    const email = (config.google_email as string) || null;
    const isExpired = config.token_expires_at
      ? (config.token_expires_at as number) < Math.floor(Date.now() / 1000) + 300
      : false;

    return json({
      success: true,
      data: { connected, email, expired: connected && isExpired },
    });
  }

  // -----------------------------------------
  // POST /api/oauth/google-workspace/disconnect/:id
  // JWT auth — removes OAuth fields from connection config
  // -----------------------------------------
  const disconnectMatch = path.match(/^\/api\/oauth\/google-workspace\/disconnect\/([^/]+)$/);
  if (disconnectMatch && method === 'POST') {
    if (!userId) return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Login required' } }, 401);

    const connectionId = disconnectMatch[1];
    const conn = await env.DB.prepare(
      'SELECT config_encrypted FROM connections WHERE id = ? AND user_id = ? AND status = ?'
    ).bind(connectionId, userId, 'active').first<{ config_encrypted: string }>();

    if (!conn) {
      return json({ success: false, error: { code: 'NOT_FOUND', message: 'Connection not found' } }, 404);
    }

    let config: Record<string, unknown> = {};
    try {
      config = await decryptConfig(conn.config_encrypted, env.ENCRYPTION_KEY);
    } catch {
      // Empty config
    }

    // Best-effort revoke at Google
    if (config.oauth_token) {
      ctx.waitUntil(
        fetch(`https://oauth2.googleapis.com/revoke?token=${config.oauth_token}`, { method: 'POST' })
          .catch(err => console.error('Google token revocation failed:', err))
      );
    }

    // Remove OAuth fields
    delete config.oauth_token;
    delete config.refresh_token;
    delete config.token_expires_at;
    delete config.google_email;

    const configEncrypted = await encryptConfig(config, env.ENCRYPTION_KEY);
    await env.DB.prepare(
      'UPDATE connections SET config_encrypted = ?, updated_at = ? WHERE id = ?'
    ).bind(configEncrypted, new Date().toISOString(), connectionId).run();

    return json({ success: true, data: { disconnected: true } });
  }

  return null;
}

// ============================================
// Token Refresh Utility
// ============================================

/**
 * Auto-refresh Google OAuth token if expired (with 300s buffer).
 * Called before tool calls for google-workspace connections.
 * Returns the config (updated if refreshed, original otherwise).
 */
export async function refreshGoogleTokenIfNeeded(
  config: Record<string, unknown>,
  env: Env,
  connectionId: string
): Promise<Record<string, unknown>> {
  if (!config.oauth_token || !config.refresh_token) return config;

  const expiresAt = config.token_expires_at as number;
  const now = Math.floor(Date.now() / 1000);

  // Not expired (with 300s buffer)
  if (expiresAt && expiresAt > now + 300) return config;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: config.refresh_token as string,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token refresh failed:', await tokenRes.text());
      return config;
    }

    const tokenData = await tokenRes.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    const updatedConfig = {
      ...config,
      oauth_token: tokenData.access_token,
      token_expires_at: now + tokenData.expires_in,
      // Google may rotate refresh tokens
      ...(tokenData.refresh_token && { refresh_token: tokenData.refresh_token }),
    };

    // Update D1 in background (don't block the tool call)
    const configEncrypted = await encryptConfig(updatedConfig, env.ENCRYPTION_KEY);
    await env.DB.prepare(
      'UPDATE connections SET config_encrypted = ?, updated_at = ? WHERE id = ?'
    ).bind(configEncrypted, new Date().toISOString(), connectionId).run();

    return updatedConfig;
  } catch (err) {
    console.error('Google token refresh error:', err);
    return config;
  }
}
