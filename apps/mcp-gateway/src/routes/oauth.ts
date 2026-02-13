/**
 * OAuth Authorization Server for MCP Gateway
 * Implements MCP spec OAuth flow with PKCE + Dynamic Client Registration
 * Supports Google and GitHub as upstream identity providers
 */

import type { Env } from '../types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GATEWAY_ORIGIN = 'https://mcp.node2flow.net';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function redirect(url: string): Response {
  return new Response(null, { status: 302, headers: { Location: url } });
}

/** Generate a random string for codes, states, client IDs */
function randomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('').slice(0, length);
}

/** Base64URL encode */
function base64UrlEncode(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** SHA256 hash for PKCE verification */
async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(hash)));
}

/** Generate JWT (same format as Platform Worker) */
async function generateJWT(
  payload: { sub: string; email: string; plan: string; mcp_scope?: string },
  secret: string,
  expiresIn = 86400
): Promise<string> {
  const encoder = new TextEncoder();
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64UrlEncode(JSON.stringify({ ...payload, iat: now, exp: now + expiresIn }));
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`));
  const sig = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  return `${header}.${body}.${sig}`;
}

/** Login page HTML — simple provider selection */
function loginPage(googleUrl: string, githubUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign in — Node2Flow</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #09090b; color: #fafafa; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 40px; width: 100%; max-width: 400px; text-align: center; }
  h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
  p { color: #a1a1aa; font-size: 14px; margin-bottom: 24px; }
  .btn { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 12px 20px; border-radius: 8px; font-size: 15px; font-weight: 500; text-decoration: none; transition: background 0.15s; cursor: pointer; border: 1px solid #3f3f46; }
  .btn-google { background: #fafafa; color: #09090b; margin-bottom: 12px; border-color: #fafafa; }
  .btn-google:hover { background: #e4e4e7; }
  .btn-github { background: #27272a; color: #fafafa; }
  .btn-github:hover { background: #3f3f46; }
  .btn svg { width: 20px; height: 20px; flex-shrink: 0; }
  .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: #52525b; font-size: 13px; }
  .divider::before, .divider::after { content: ''; flex: 1; border-top: 1px solid #27272a; }
  .footer { margin-top: 24px; font-size: 12px; color: #52525b; }
  .footer a { color: #71717a; text-decoration: none; }
</style>
</head>
<body>
<div class="card">
  <h1>Node2Flow</h1>
  <p>Sign in to connect your MCP tools</p>
  <a href="${googleUrl}" class="btn btn-google">
    <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
    Continue with Google
  </a>
  <div class="divider">or</div>
  <a href="${githubUrl}" class="btn btn-github">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
    Continue with GitHub
  </a>
  <div class="footer">By signing in, you agree to our <a href="https://app.node2flow.net/terms">Terms</a></div>
</div>
</body>
</html>`;
}

/** Key selector page HTML — shown after OAuth login when user has global API keys */
function keySelectPage(
  email: string,
  sessionId: string,
  keys: Array<{ id: string; name: string; prefix: string; scope: string | null }>
): string {
  const keyRows = keys.map(k => {
    const scope = k.scope ? JSON.parse(k.scope) as { plugins?: string[]; permissions?: string[] } : null;
    const scopeLabel = !scope
      ? 'Full Access'
      : scope.permissions?.length === 1 && scope.permissions[0] === 'read'
        ? 'Read Only'
        : 'Custom';
    const scopeDetail = !scope
      ? 'All plugins, all permissions'
      : [
          scope.plugins?.length ? `${scope.plugins.length} plugin${scope.plugins.length > 1 ? 's' : ''}` : 'All plugins',
          scope.permissions?.join(', ') || 'all permissions',
        ].join(' · ');
    const badgeColor = scopeLabel === 'Full Access' ? '#22c55e' : scopeLabel === 'Read Only' ? '#3b82f6' : '#f59e0b';
    return `<button type="submit" name="key_id" value="${k.id}" class="key-btn">
      <div class="key-info">
        <div class="key-name">${k.name || 'Unnamed Key'}</div>
        <div class="key-detail">${k.prefix}••• · ${scopeDetail}</div>
      </div>
      <span class="badge" style="background:${badgeColor}20;color:${badgeColor}">${scopeLabel}</span>
    </button>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Select API Key — Node2Flow</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #09090b; color: #fafafa; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; width: 100%; max-width: 440px; }
  h1 { font-size: 20px; font-weight: 600; margin-bottom: 4px; text-align: center; }
  .subtitle { color: #a1a1aa; font-size: 13px; margin-bottom: 20px; text-align: center; }
  .email { color: #fafafa; font-weight: 500; }
  .keys { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .key-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 16px; border-radius: 8px; border: 1px solid #3f3f46; background: #27272a; color: #fafafa; cursor: pointer; transition: border-color 0.15s, background 0.15s; text-align: left; font-family: inherit; }
  .key-btn:hover { border-color: #fafafa; background: #3f3f46; }
  .key-info { flex: 1; min-width: 0; }
  .key-name { font-size: 14px; font-weight: 500; margin-bottom: 2px; }
  .key-detail { font-size: 12px; color: #71717a; }
  .badge { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 9999px; white-space: nowrap; margin-left: 12px; }
  .divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: #52525b; font-size: 12px; }
  .divider::before, .divider::after { content: ''; flex: 1; border-top: 1px solid #27272a; }
  .full-btn { display: block; width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid #3f3f46; background: transparent; color: #a1a1aa; cursor: pointer; font-size: 14px; font-family: inherit; transition: border-color 0.15s, color 0.15s; }
  .full-btn:hover { border-color: #fafafa; color: #fafafa; }
</style>
</head>
<body>
<form method="POST" action="${GATEWAY_ORIGIN}/oauth/select-key" class="card">
  <input type="hidden" name="session_id" value="${sessionId}">
  <h1>Select API Key</h1>
  <div class="subtitle">Signed in as <span class="email">${email}</span></div>
  <div class="keys">${keyRows}</div>
  <div class="divider">or</div>
  <button type="submit" name="key_id" value="_none" class="full-btn">Continue with Full Access</button>
</form>
</body>
</html>`;
}

// ============================================
// OAuth Route Handler
// ============================================

export async function handleOAuthRoutes(
  request: Request,
  env: Env,
  path: string,
  ctx: ExecutionContext
): Promise<Response | null> {
  const method = request.method;

  // -----------------------------------------
  // GET /.well-known/oauth-protected-resource
  // -----------------------------------------
  if (path === '/.well-known/oauth-protected-resource' && method === 'GET') {
    return json({
      resource: GATEWAY_ORIGIN,
      authorization_servers: [GATEWAY_ORIGIN],
      bearer_methods_supported: ['header'],
    });
  }

  // -----------------------------------------
  // GET /.well-known/oauth-authorization-server
  // -----------------------------------------
  if (path === '/.well-known/oauth-authorization-server' && method === 'GET') {
    return json({
      issuer: GATEWAY_ORIGIN,
      authorization_endpoint: `${GATEWAY_ORIGIN}/oauth/authorize`,
      token_endpoint: `${GATEWAY_ORIGIN}/oauth/token`,
      registration_endpoint: `${GATEWAY_ORIGIN}/oauth/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['client_secret_post'],
    });
  }

  // -----------------------------------------
  // POST /oauth/register — Dynamic Client Registration (RFC 7591)
  // -----------------------------------------
  if (path === '/oauth/register' && method === 'POST') {
    const body = await request.json() as {
      redirect_uris?: string[];
      client_name?: string;
    };

    if (!body.redirect_uris?.length) {
      return json({ error: 'invalid_client_metadata', error_description: 'redirect_uris required' }, 400);
    }

    const clientId = `mcp_${randomString(32)}`;
    const clientSecret = randomString(64);

    await env.OAUTH_KV.put(
      `mcp_client:${clientId}`,
      JSON.stringify({
        client_secret: clientSecret,
        redirect_uris: body.redirect_uris,
        client_name: body.client_name || 'MCP Client',
      }),
      { expirationTtl: 86400 } // 24h
    );

    return json({
      client_id: clientId,
      client_secret: clientSecret,
      client_name: body.client_name || 'MCP Client',
      redirect_uris: body.redirect_uris,
    }, 201);
  }

  // -----------------------------------------
  // GET /oauth/authorize — Show provider selection page
  // -----------------------------------------
  if (path === '/oauth/authorize' && method === 'GET') {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    const redirectUri = url.searchParams.get('redirect_uri');
    const state = url.searchParams.get('state');
    const codeChallenge = url.searchParams.get('code_challenge');
    const codeChallengeMethod = url.searchParams.get('code_challenge_method');
    const responseType = url.searchParams.get('response_type');

    if (!clientId || !redirectUri || !state || !codeChallenge || responseType !== 'code') {
      return json({ error: 'invalid_request', error_description: 'Missing required parameters' }, 400);
    }
    if (codeChallengeMethod !== 'S256') {
      return json({ error: 'invalid_request', error_description: 'Only S256 code_challenge_method supported' }, 400);
    }

    const clientData = await env.OAUTH_KV.get(`mcp_client:${clientId}`, 'json') as {
      client_secret: string; redirect_uris: string[]; client_name: string;
    } | null;

    if (!clientData) {
      return json({ error: 'invalid_client', error_description: 'Unknown client_id' }, 400);
    }

    if (!clientData.redirect_uris.includes(redirectUri)) {
      return json({ error: 'invalid_request', error_description: 'redirect_uri not registered' }, 400);
    }

    // Build start URLs for each provider
    const params = url.searchParams.toString();
    const googleUrl = `${GATEWAY_ORIGIN}/oauth/authorize/start?provider=google&${params}`;
    const githubUrl = `${GATEWAY_ORIGIN}/oauth/authorize/start?provider=github&${params}`;

    return new Response(loginPage(googleUrl, githubUrl), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // -----------------------------------------
  // GET /oauth/authorize/start — Redirect to upstream IdP
  // -----------------------------------------
  if (path === '/oauth/authorize/start' && method === 'GET') {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    const redirectUri = url.searchParams.get('redirect_uri');
    const state = url.searchParams.get('state');
    const codeChallenge = url.searchParams.get('code_challenge');
    const codeChallengeMethod = url.searchParams.get('code_challenge_method');
    const provider = (url.searchParams.get('provider') || 'google') as 'google' | 'github';

    if (!clientId || !redirectUri || !state || !codeChallenge) {
      return json({ error: 'invalid_request', error_description: 'Missing required parameters' }, 400);
    }

    // Store OAuth state (PKCE + client info) in KV
    const internalState = randomString(32);
    await env.OAUTH_KV.put(
      `mcp_oauth_state:${internalState}`,
      JSON.stringify({
        client_state: state,
        client_id: clientId,
        redirect_uri: redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod || 'S256',
        provider,
      }),
      { expirationTtl: 600 } // 10min
    );

    if (provider === 'google') {
      const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
      googleUrl.searchParams.set('redirect_uri', `${GATEWAY_ORIGIN}/oauth/callback`);
      googleUrl.searchParams.set('response_type', 'code');
      googleUrl.searchParams.set('scope', 'email profile');
      googleUrl.searchParams.set('state', internalState);
      googleUrl.searchParams.set('access_type', 'online');
      return redirect(googleUrl.toString());
    }

    // GitHub
    const githubUrl = new URL('https://github.com/login/oauth/authorize');
    githubUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
    githubUrl.searchParams.set('redirect_uri', `${GATEWAY_ORIGIN}/oauth/callback`);
    githubUrl.searchParams.set('scope', 'user:email');
    githubUrl.searchParams.set('state', internalState);
    return redirect(githubUrl.toString());
  }

  // -----------------------------------------
  // GET /oauth/callback — Upstream IdP callback
  // -----------------------------------------
  if (path === '/oauth/callback' && method === 'GET') {
    try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const internalState = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return json({ error: 'access_denied', error_description: error }, 400);
    }
    if (!code || !internalState) {
      return json({ error: 'invalid_request', error_description: 'Missing code or state' }, 400);
    }

    // Retrieve and delete OAuth state
    const stateData = await env.OAUTH_KV.get(`mcp_oauth_state:${internalState}`, 'json') as {
      client_state: string;
      client_id: string;
      redirect_uri: string;
      code_challenge: string;
      code_challenge_method: string;
      provider: 'google' | 'github';
    } | null;

    if (!stateData) {
      return json({ error: 'invalid_request', error_description: 'Invalid or expired state' }, 400);
    }

    // Delete state (one-time use)
    ctx.waitUntil(env.OAUTH_KV.delete(`mcp_oauth_state:${internalState}`));

    // Exchange code with upstream provider
    let email: string;
    let oauthId: string;

    if (stateData.provider === 'google') {
      // Exchange code for Google access token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${GATEWAY_ORIGIN}/oauth/callback`,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        return json({ error: 'server_error', error_description: 'Failed to exchange Google code' }, 500);
      }

      const tokenData = await tokenRes.json() as { access_token: string };

      // Get user info
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userRes.ok) {
        return json({ error: 'server_error', error_description: 'Failed to get Google user info' }, 500);
      }

      const userInfo = await userRes.json() as { id: string; email: string };
      email = userInfo.email;
      oauthId = userInfo.id;
    } else {
      // GitHub: exchange code for access token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${GATEWAY_ORIGIN}/oauth/callback`,
        }),
      });

      if (!tokenRes.ok) {
        return json({ error: 'server_error', error_description: 'Failed to exchange GitHub code' }, 500);
      }

      const tokenData = await tokenRes.json() as { access_token: string };

      // Get user info
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'Node2Flow-MCP' },
      });
      const userData = await userRes.json() as { id: number; email: string | null };

      // GitHub email might be private — fetch from emails API
      if (!userData.email) {
        const emailRes = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'Node2Flow-MCP' },
        });
        const emails = await emailRes.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
        const primary = emails.find(e => e.primary && e.verified);
        if (!primary) {
          return json({ error: 'server_error', error_description: 'No verified email from GitHub' }, 500);
        }
        email = primary.email;
      } else {
        email = userData.email;
      }
      oauthId = String(userData.id);
    }

    // Find or create user via Platform service binding
    const platformRes = await env.PLATFORM.fetch(
      new Request('https://platform.internal/internal/find-or-create-oauth-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          oauth_provider: stateData.provider,
          oauth_id: oauthId,
        }),
      })
    );

    if (!platformRes.ok) {
      return json({ error: 'server_error', error_description: 'Failed to find or create user' }, 500);
    }

    const user = await platformRes.json() as {
      user_id: string; email: string; plan: string; is_new_user: boolean;
    };

    // Check if user has global API keys
    const keysRes = await env.PLATFORM.fetch(
      new Request('https://platform.internal/internal/get-user-api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id }),
      })
    );

    const keysData = keysRes.ok
      ? await keysRes.json() as { api_keys: Array<{ id: string; name: string; prefix: string; scope: string | null }> }
      : { api_keys: [] };

    // If user has global keys → show key selector page
    if (keysData.api_keys.length > 0) {
      const sessionId = randomString(32);
      await env.OAUTH_KV.put(
        `mcp_oauth_session:${sessionId}`,
        JSON.stringify({
          user_id: user.user_id,
          email: user.email,
          plan: user.plan,
          client_id: stateData.client_id,
          client_state: stateData.client_state,
          redirect_uri: stateData.redirect_uri,
          code_challenge: stateData.code_challenge,
          api_keys: keysData.api_keys,
        }),
        { expirationTtl: 600 } // 10min
      );

      return new Response(keySelectPage(user.email, sessionId, keysData.api_keys), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // No global keys → generate auth code with full access (no scope)
    const authCode = randomString(64);
    await env.OAUTH_KV.put(
      `mcp_authcode:${authCode}`,
      JSON.stringify({
        user_id: user.user_id,
        email: user.email,
        plan: user.plan,
        client_id: stateData.client_id,
        redirect_uri: stateData.redirect_uri,
        code_challenge: stateData.code_challenge,
      }),
      { expirationTtl: 300 } // 5min
    );

    // Redirect back to MCP client with auth code
    const clientRedirect = new URL(stateData.redirect_uri);
    clientRedirect.searchParams.set('code', authCode);
    clientRedirect.searchParams.set('state', stateData.client_state);
    return redirect(clientRedirect.toString());
    } catch (err) {
      return json({ error: 'server_error', error_description: err instanceof Error ? err.message : 'Unknown error' }, 500);
    }
  }

  // -----------------------------------------
  // POST /oauth/select-key — Key selector form submission
  // -----------------------------------------
  if (path === '/oauth/select-key' && method === 'POST') {
    // Parse form data
    const formData = await request.text();
    const params = new URLSearchParams(formData);
    const sessionId = params.get('session_id');
    const keyId = params.get('key_id');

    if (!sessionId || !keyId) {
      return json({ error: 'invalid_request', error_description: 'Missing session_id or key_id' }, 400);
    }

    // Retrieve and delete session
    const sessionData = await env.OAUTH_KV.get(`mcp_oauth_session:${sessionId}`, 'json') as {
      user_id: string;
      email: string;
      plan: string;
      client_id: string;
      client_state: string;
      redirect_uri: string;
      code_challenge: string;
      api_keys: Array<{ id: string; name: string; prefix: string; scope: string | null }>;
    } | null;

    if (!sessionData) {
      return json({ error: 'invalid_request', error_description: 'Invalid or expired session' }, 400);
    }

    // Delete session (one-time use)
    ctx.waitUntil(env.OAUTH_KV.delete(`mcp_oauth_session:${sessionId}`));

    // Determine scope from selected key
    let mcpScope: string | undefined;
    if (keyId !== '_none') {
      const selectedKey = sessionData.api_keys.find(k => k.id === keyId);
      if (!selectedKey) {
        return json({ error: 'invalid_request', error_description: 'Selected key not found' }, 400);
      }
      // Use the key's scope (null = full access, string = JSON scope)
      if (selectedKey.scope) {
        mcpScope = selectedKey.scope;
      }
    }
    // keyId === '_none' or key has no scope → mcpScope stays undefined (full access)

    // Generate authorization code
    const authCode = randomString(64);
    await env.OAUTH_KV.put(
      `mcp_authcode:${authCode}`,
      JSON.stringify({
        user_id: sessionData.user_id,
        email: sessionData.email,
        plan: sessionData.plan,
        client_id: sessionData.client_id,
        redirect_uri: sessionData.redirect_uri,
        code_challenge: sessionData.code_challenge,
        ...(mcpScope ? { mcp_scope: mcpScope } : {}),
      }),
      { expirationTtl: 300 } // 5min
    );

    // Redirect back to MCP client
    const clientRedirect = new URL(sessionData.redirect_uri);
    clientRedirect.searchParams.set('code', authCode);
    clientRedirect.searchParams.set('state', sessionData.client_state);
    return redirect(clientRedirect.toString());
  }

  // -----------------------------------------
  // POST /oauth/token — Token Endpoint
  // -----------------------------------------
  if (path === '/oauth/token' && method === 'POST') {
    // OAuth spec requires application/x-www-form-urlencoded for token endpoint
    let body: {
      grant_type: string;
      code: string;
      redirect_uri: string;
      client_id: string;
      client_secret: string;
      code_verifier: string;
    };

    const contentType = request.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // application/x-www-form-urlencoded (standard OAuth)
      const formData = await request.text();
      const params = new URLSearchParams(formData);
      body = {
        grant_type: params.get('grant_type') || '',
        code: params.get('code') || '',
        redirect_uri: params.get('redirect_uri') || '',
        client_id: params.get('client_id') || '',
        client_secret: params.get('client_secret') || '',
        code_verifier: params.get('code_verifier') || '',
      };
    }

    if (body.grant_type !== 'authorization_code') {
      return json({ error: 'unsupported_grant_type' }, 400);
    }

    if (!body.code || !body.client_id || !body.client_secret || !body.code_verifier) {
      return json({ error: 'invalid_request', error_description: 'Missing required parameters' }, 400);
    }

    // Validate client
    const clientData = await env.OAUTH_KV.get(`mcp_client:${body.client_id}`, 'json') as {
      client_secret: string; redirect_uris: string[];
    } | null;

    if (!clientData || clientData.client_secret !== body.client_secret) {
      return json({ error: 'invalid_client' }, 401);
    }

    // Get and delete auth code (one-time use)
    const authData = await env.OAUTH_KV.get(`mcp_authcode:${body.code}`, 'json') as {
      user_id: string; email: string; plan: string;
      client_id: string; redirect_uri: string; code_challenge: string;
      mcp_scope?: string;
    } | null;

    if (!authData) {
      return json({ error: 'invalid_grant', error_description: 'Invalid or expired code' }, 400);
    }

    // Delete auth code immediately
    await env.OAUTH_KV.delete(`mcp_authcode:${body.code}`);

    // Validate client_id and redirect_uri match
    if (authData.client_id !== body.client_id || authData.redirect_uri !== body.redirect_uri) {
      return json({ error: 'invalid_grant', error_description: 'client_id or redirect_uri mismatch' }, 400);
    }

    // Verify PKCE: SHA256(code_verifier) must equal stored code_challenge
    const computedChallenge = await sha256(body.code_verifier);
    if (computedChallenge !== authData.code_challenge) {
      return json({ error: 'invalid_grant', error_description: 'PKCE verification failed' }, 400);
    }

    // Generate JWT access token (mcp_scope is JSON string from selected API key, or undefined for full access)
    const accessToken = await generateJWT(
      {
        sub: authData.user_id,
        email: authData.email,
        plan: authData.plan,
        ...(authData.mcp_scope ? { mcp_scope: authData.mcp_scope } : {}),
      },
      env.JWT_SECRET,
      86400 // 24h
    );

    return json({
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: 86400,
    });
  }

  return null;
}
