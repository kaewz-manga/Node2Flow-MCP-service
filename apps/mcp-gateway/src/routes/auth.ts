/**
 * Auth Middleware for MCP Gateway
 * Validates API keys via Platform service binding or JWT for MCP/dashboard
 */

import type { Env, Connection, AuthResult } from '../types';
import { decryptConfig } from './connections';

interface JWTPayload {
  sub: string;
  email: string;
  plan: string;
  is_admin?: boolean;
  mcp_scope?: string;
  exp: number;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Verify JWT token (shared secret with Platform Worker)
 */
async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signedData = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

    const valid = await crypto.subtle.verify('HMAC', key, signature, signedData);
    if (!valid) return null;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))) as JWTPayload;

    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Authenticate MCP request using API key (n2f_xxx)
 * Validates via Platform service binding
 */
export async function authenticateMcpRequest(
  request: Request,
  env: Env
): Promise<{ context: AuthResult | null; error: string | null }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { context: null, error: 'OAUTH_REQUIRED' };
  }

  const token = authHeader.slice(7);

  // API key auth (n2f_xxx prefix)
  if (token.startsWith('n2f_')) {
    try {
      // Validate API key via Platform service binding
      const platformResponse = await env.PLATFORM.fetch(
        new Request('https://platform.internal/internal/validate-api-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: token }),
        })
      );

      if (!platformResponse.ok) {
        return { context: null, error: 'Invalid API key' };
      }

      const result = await platformResponse.json() as {
        user_id: string;
        email: string;
        plan: string;
        connection_id: string;
        api_key_id: string;
        scope: string | null;
        usage: { current: number; limit: number; remaining: number };
      };

      const scope = result.scope ? JSON.parse(result.scope) as { plugins?: string[]; permissions?: string[] } : null;

      // All-services key (_all) → resolve connection per tool call (like OAuth)
      if (result.connection_id === '_all') {
        return {
          context: {
            userId: result.user_id,
            email: result.email,
            plan: result.plan,
            connectionId: null,
            productType: null,
            config: null,
            apiKeyId: result.api_key_id,
            usage: result.usage,
            authMethod: 'api_key',
            scope,
          },
          error: null,
        };
      }

      // Single-connection key → get specific connection config
      const conn = await env.DB.prepare(
        'SELECT * FROM connections WHERE id = ? AND status = ?'
      ).bind(result.connection_id, 'active').first<Connection>();

      if (!conn) {
        return { context: null, error: 'Connection not found or inactive' };
      }

      const config = await decryptConfig(conn.config_encrypted, env.ENCRYPTION_KEY);

      return {
        context: {
          userId: result.user_id,
          email: result.email,
          plan: result.plan,
          connectionId: conn.id,
          productType: conn.product_type,
          config,
          apiKeyId: result.api_key_id,
          usage: result.usage,
          authMethod: 'api_key',
          scope,
        },
        error: null,
      };
    } catch (err) {
      return { context: null, error: `Authentication failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
    }
  }

  // JWT auth (OAuth flow — token from /oauth/token)
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (payload) {
    // Get usage info from Platform
    const usageRes = await env.PLATFORM.fetch(
      new Request('https://platform.internal/internal/get-user-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: payload.sub, plan: payload.plan }),
      })
    );

    const usageData = usageRes.ok
      ? await usageRes.json() as { current: number; limit: number; remaining: number; oauth_scope?: string | null }
      : { current: 0, limit: 100, remaining: 100, oauth_scope: null };

    // Scope priority: JWT mcp_scope (from key selector) > user's default oauth_scope
    let scope: { plugins?: string[]; permissions?: string[] } | null = null;
    if (payload.mcp_scope) {
      try { scope = JSON.parse(payload.mcp_scope); } catch { /* corrupt scope → full access */ }
    } else if (usageData.oauth_scope) {
      try { scope = JSON.parse(usageData.oauth_scope); } catch { /* corrupt scope → full access */ }
    }

    return {
      context: {
        userId: payload.sub,
        email: payload.email,
        plan: payload.plan,
        connectionId: null,
        productType: null,
        config: null,
        apiKeyId: 'oauth',
        usage: usageData,
        authMethod: 'oauth',
        scope,
      },
      error: null,
    };
  }

  // No valid auth → signal OAuth required
  return { context: null, error: 'OAUTH_REQUIRED' };
}

/**
 * Authenticate Dashboard request using JWT
 */
export async function authenticateDashboardRequest(
  request: Request,
  env: Env
): Promise<{ userId: string; email: string; plan: string; isAdmin: boolean } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  if (token.startsWith('n2f_')) return null; // API key, not JWT

  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return null;

  return {
    userId: payload.sub,
    email: payload.email,
    plan: payload.plan,
    isAdmin: payload.is_admin || false,
  };
}
