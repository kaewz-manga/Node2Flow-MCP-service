/**
 * Auth Middleware for MCP Gateway
 * Validates API keys via Platform service binding or JWT for dashboard
 */

import type { Env, Connection } from '../types';
import { decryptConfig } from './connections';

interface AuthResult {
  userId: string;
  email: string;
  plan: string;
  connectionId: string;
  productType: string;
  config: Record<string, unknown>;
  apiKeyId: string;
  usage: { current: number; limit: number; remaining: number };
}

interface JWTPayload {
  sub: string;
  email: string;
  plan: string;
  is_admin?: boolean;
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
    return { context: null, error: 'Missing Authorization header' };
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
        usage: { current: number; limit: number; remaining: number };
      };

      // Get connection config from Gateway DB
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
        },
        error: null,
      };
    } catch (err) {
      return { context: null, error: `Authentication failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
    }
  }

  return { context: null, error: 'Invalid token format' };
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
