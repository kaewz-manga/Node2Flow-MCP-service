/**
 * API Key Database Operations
 */

import { ApiKey } from '../types/platform';
import { generateUUID } from '../crypto-utils';

export async function createApiKey(
  db: D1Database,
  userId: string,
  connectionId: string,
  keyHash: string,
  keyPrefix: string,
  name: string = 'Default',
  scope: string | null = null,
  expiresAt: string | null = null
): Promise<ApiKey> {
  const id = generateUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO api_keys (id, user_id, connection_id, key_hash, key_prefix, name, scope, expires_at, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`
    )
    .bind(id, userId, connectionId, keyHash, keyPrefix, name, scope, expiresAt, now)
    .run();

  return {
    id,
    user_id: userId,
    connection_id: connectionId,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    name,
    scope,
    status: 'active',
    expires_at: expiresAt,
    last_used_at: null,
    created_at: now,
  };
}

export async function getApiKeyByHash(db: D1Database, keyHash: string): Promise<ApiKey | null> {
  const result = await db
    .prepare('SELECT * FROM api_keys WHERE key_hash = ? AND status = ?')
    .bind(keyHash, 'active')
    .first<ApiKey>();

  return result || null;
}

export async function getApiKeysByUserId(db: D1Database, userId: string): Promise<ApiKey[]> {
  const result = await db
    .prepare('SELECT * FROM api_keys WHERE user_id = ?')
    .bind(userId)
    .all<ApiKey>();

  return result.results || [];
}

export async function updateApiKeyLastUsed(db: D1Database, id: string): Promise<void> {
  await db
    .prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), id)
    .run();
}

export async function revokeApiKey(db: D1Database, id: string): Promise<void> {
  await db
    .prepare('UPDATE api_keys SET status = ? WHERE id = ?')
    .bind('revoked', id)
    .run();
}
