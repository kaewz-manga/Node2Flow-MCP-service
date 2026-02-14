/**
 * Unified Connections CRUD
 * Shared across all products - uses product_type column
 */

import type { Env, Connection } from '../types';
import { getPlugin } from '../plugin-registry';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function generateUUID(): string {
  return crypto.randomUUID();
}

// AES-256-GCM encrypt/decrypt using Web Crypto API
async function encryptConfig(config: Record<string, unknown>, encryptionKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(config));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(encryptionKey.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    data
  );

  // Format: base64(iv + ciphertext)
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

async function decryptConfig(encrypted: string, encryptionKey: string): Promise<Record<string, unknown>> {
  const encoder = new TextEncoder();
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(encryptionKey.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    ciphertext
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}

export { decryptConfig, encryptConfig };

// ============================================
// Connection CRUD Handlers
// ============================================

export async function handleListConnections(
  env: Env,
  userId: string,
  productType?: string
): Promise<Response> {
  let query = 'SELECT id, user_id, product_type, name, status, last_used_at, created_at, updated_at FROM connections WHERE user_id = ? AND status != ?';
  const binds: unknown[] = [userId, 'deleted'];

  if (productType) {
    query += ' AND product_type = ?';
    binds.push(productType);
  }

  query += ' ORDER BY created_at DESC';

  const result = await env.DB.prepare(query).bind(...binds).all<Connection>();

  return json({
    success: true,
    data: { connections: result.results || [] },
  });
}

export async function handleCreateConnection(
  env: Env,
  userId: string,
  body: { product_type: string; name: string; config: Record<string, unknown> }
): Promise<Response> {
  const { product_type, name, config } = body;

  // Validate plugin exists
  const plugin = getPlugin(product_type);
  if (!plugin) {
    return json({ success: false, error: { code: 'INVALID_PRODUCT', message: `Unknown product type: ${product_type}` } }, 400);
  }

  if (!name || !config) {
    return json({ success: false, error: { code: 'MISSING_FIELDS', message: 'name and config are required' } }, 400);
  }

  const id = generateUUID();
  const now = new Date().toISOString();
  const configEncrypted = await encryptConfig(config, env.ENCRYPTION_KEY);

  await env.DB.prepare(
    `INSERT INTO connections (id, user_id, product_type, name, config_encrypted, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`
  ).bind(id, userId, product_type, name, configEncrypted, now, now).run();

  return json({
    success: true,
    data: {
      id,
      user_id: userId,
      product_type,
      name,
      status: 'active',
      created_at: now,
    },
  }, 201);
}

export async function handleDeleteConnection(
  env: Env,
  userId: string,
  connectionId: string
): Promise<Response> {
  // Verify ownership
  const conn = await env.DB.prepare(
    'SELECT id, user_id FROM connections WHERE id = ? AND user_id = ?'
  ).bind(connectionId, userId).first<{ id: string; user_id: string }>();

  if (!conn) {
    return json({ success: false, error: { code: 'NOT_FOUND', message: 'Connection not found' } }, 404);
  }

  await env.DB.prepare(
    'DELETE FROM connections WHERE id = ?'
  ).bind(connectionId).run();

  return json({ success: true, data: { deleted: true } });
}

export async function handleUpdateConnection(
  env: Env,
  userId: string,
  connectionId: string,
  body: { name?: string; config?: Record<string, unknown>; status?: string }
): Promise<Response> {
  // Verify ownership
  const conn = await env.DB.prepare(
    'SELECT id, user_id FROM connections WHERE id = ? AND user_id = ?'
  ).bind(connectionId, userId).first<{ id: string; user_id: string }>();

  if (!conn) {
    return json({ success: false, error: { code: 'NOT_FOUND', message: 'Connection not found' } }, 404);
  }

  const updates: string[] = [];
  const binds: unknown[] = [];

  if (body.name) {
    updates.push('name = ?');
    binds.push(body.name);
  }
  if (body.config) {
    updates.push('config_encrypted = ?');
    binds.push(await encryptConfig(body.config, env.ENCRYPTION_KEY));
  }
  if (body.status) {
    updates.push('status = ?');
    binds.push(body.status);
  }

  if (updates.length === 0) {
    return json({ success: false, error: { code: 'NO_CHANGES', message: 'No fields to update' } }, 400);
  }

  updates.push('updated_at = ?');
  binds.push(new Date().toISOString());
  binds.push(connectionId);

  await env.DB.prepare(
    `UPDATE connections SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...binds).run();

  return json({ success: true, data: { updated: true } });
}

export async function getConnectionWithConfig(
  env: Env,
  connectionId: string
): Promise<(Connection & { config: Record<string, unknown> }) | null> {
  const conn = await env.DB.prepare(
    'SELECT * FROM connections WHERE id = ? AND status = ?'
  ).bind(connectionId, 'active').first<Connection>();

  if (!conn) return null;

  const config = await decryptConfig(conn.config_encrypted, env.ENCRYPTION_KEY);
  return { ...conn, config };
}
