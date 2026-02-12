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
  payload: { sub: string; email: string; plan: string },
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
  // GET /oauth/authorize — Authorization Endpoint
  // -----------------------------------------
  if (path === '/oauth/authorize' && method === 'GET') {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    const redirectUri = url.searchParams.get('redirect_uri');
    const state = url.searchParams.get('state');
    const codeChallenge = url.searchParams.get('code_challenge');
    const codeChallengeMethod = url.searchParams.get('code_challenge_method');
    const responseType = url.searchParams.get('response_type');

    // Validate required params
    if (!clientId || !redirectUri || !state || !codeChallenge || responseType !== 'code') {
      return json({ error: 'invalid_request', error_description: 'Missing required parameters' }, 400);
    }
    if (codeChallengeMethod !== 'S256') {
      return json({ error: 'invalid_request', error_description: 'Only S256 code_challenge_method supported' }, 400);
    }

    // Validate client_id
    const clientData = await env.OAUTH_KV.get(`mcp_client:${clientId}`, 'json') as {
      client_secret: string; redirect_uris: string[]; client_name: string;
    } | null;

    if (!clientData) {
      return json({ error: 'invalid_client', error_description: 'Unknown client_id' }, 400);
    }

    // Validate redirect_uri
    if (!clientData.redirect_uris.includes(redirectUri)) {
      return json({ error: 'invalid_request', error_description: 'redirect_uri not registered' }, 400);
    }

    // Choose provider — default to Google, support ?provider=github
    const provider = (url.searchParams.get('provider') || 'google') as 'google' | 'github';

    // Store OAuth state (PKCE + client info) in KV
    const internalState = randomString(32);
    await env.OAUTH_KV.put(
      `mcp_oauth_state:${internalState}`,
      JSON.stringify({
        client_state: state,
        client_id: clientId,
        redirect_uri: redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        provider,
      }),
      { expirationTtl: 600 } // 10min
    );

    // Redirect to upstream IdP
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

    // Generate authorization code for the MCP client
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

    // Generate JWT access token
    const accessToken = await generateJWT(
      { sub: authData.user_id, email: authData.email, plan: authData.plan },
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
