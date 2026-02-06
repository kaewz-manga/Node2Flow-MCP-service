/**
 * Connection Database Operations
 * Currently n8n-specific, will become generic unified connections in Phase 3
 */

import { generateUUID } from '../crypto-utils';

export interface N8nConnection {
  id: string;
  user_id: string;
  name: string;
  n8n_url: string;
  n8n_api_key_encrypted: string;
  status: 'active' | 'inactive' | 'error';
  last_tested_at: string | null;
  last_used_at?: string | null;
  created_at: string;
  updated_at: string;
}

export async function createConnection(
  db: D1Database,
  userId: string,
  name: string,
  n8nUrl: string,
  n8nApiKeyEncrypted: string
): Promise<N8nConnection> {
  const id = generateUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO n8n_connections (id, user_id, name, n8n_url, n8n_api_key_encrypted, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`
    )
    .bind(id, userId, name, n8nUrl, n8nApiKeyEncrypted, now, now)
    .run();

  return {
    id,
    user_id: userId,
    name,
    n8n_url: n8nUrl,
    n8n_api_key_encrypted: n8nApiKeyEncrypted,
    status: 'active',
    last_tested_at: null,
    created_at: now,
    updated_at: now,
  };
}

export async function getConnectionsByUserId(
  db: D1Database,
  userId: string
): Promise<N8nConnection[]> {
  const result = await db
    .prepare('SELECT * FROM n8n_connections WHERE user_id = ? AND status != ?')
    .bind(userId, 'deleted')
    .all<N8nConnection>();

  return result.results || [];
}

export async function getConnectionById(
  db: D1Database,
  id: string
): Promise<N8nConnection | null> {
  const result = await db
    .prepare('SELECT * FROM n8n_connections WHERE id = ?')
    .bind(id)
    .first<N8nConnection>();

  return result || null;
}

export async function updateConnectionStatus(
  db: D1Database,
  id: string,
  status: string
): Promise<void> {
  await db
    .prepare('UPDATE n8n_connections SET status = ?, updated_at = ? WHERE id = ?')
    .bind(status, new Date().toISOString(), id)
    .run();
}

export async function deleteConnection(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM api_keys WHERE connection_id = ?').bind(id).run();
  await db.prepare('DELETE FROM n8n_connections WHERE id = ?').bind(id).run();
}

export async function countUserConnections(db: D1Database, userId: string): Promise<number> {
  const result = await db
    .prepare('SELECT COUNT(*) as count FROM n8n_connections WHERE user_id = ? AND status = ?')
    .bind(userId, 'active')
    .first<{ count: number }>();

  return result?.count || 0;
}

// ============================================
// Connection Activity Tracking
// ============================================

export async function updateConnectionLastUsed(db: D1Database, connectionId: string): Promise<void> {
  await db
    .prepare('UPDATE n8n_connections SET last_used_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), connectionId)
    .run();
}

export async function getInactiveFreePlanConnections(
  db: D1Database,
  daysInactive: number = 14
): Promise<{ id: string; user_id: string; name: string; user_email: string }[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  const result = await db
    .prepare(`
      SELECT c.id, c.user_id, c.name, u.email as user_email
      FROM n8n_connections c
      JOIN users u ON c.user_id = u.id
      WHERE u.plan = 'free'
        AND u.status = 'active'
        AND c.status = 'active'
        AND (c.last_used_at IS NULL OR c.last_used_at < ?)
    `)
    .bind(cutoffDate.toISOString())
    .all<{ id: string; user_id: string; name: string; user_email: string }>();

  return result.results || [];
}

// ============================================
// AI Connection Operations
// ============================================

export interface AiConnectionRecord {
  id: string;
  user_id: string;
  name: string;
  provider_url: string;
  api_key_encrypted: string;
  model_name: string;
  is_default: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export async function createAiConnection(
  db: D1Database,
  userId: string,
  name: string,
  providerUrl: string,
  apiKeyEncrypted: string,
  modelName: string
): Promise<AiConnectionRecord> {
  const id = generateUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO ai_connections (id, user_id, name, provider_url, api_key_encrypted, model_name, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`
    )
    .bind(id, userId, name, providerUrl, apiKeyEncrypted, modelName, now, now)
    .run();

  return {
    id,
    user_id: userId,
    name,
    provider_url: providerUrl,
    api_key_encrypted: apiKeyEncrypted,
    model_name: modelName,
    is_default: 0,
    status: 'active',
    created_at: now,
    updated_at: now,
  };
}

export async function getAiConnectionsByUserId(
  db: D1Database,
  userId: string
): Promise<AiConnectionRecord[]> {
  const result = await db
    .prepare('SELECT * FROM ai_connections WHERE user_id = ? AND status = ?')
    .bind(userId, 'active')
    .all<AiConnectionRecord>();
  return result.results || [];
}

export async function getAiConnectionById(
  db: D1Database,
  id: string
): Promise<AiConnectionRecord | null> {
  return db
    .prepare('SELECT * FROM ai_connections WHERE id = ?')
    .bind(id)
    .first<AiConnectionRecord>();
}

export async function deleteAiConnection(
  db: D1Database,
  id: string
): Promise<void> {
  await db.prepare('DELETE FROM ai_connections WHERE id = ?').bind(id).run();
}

// ============================================
// Bot Connection Operations
// ============================================

export interface BotConnectionRecord {
  id: string;
  user_id: string;
  platform: 'telegram' | 'line';
  name: string;
  bot_token_encrypted: string;
  channel_secret_encrypted: string | null;
  ai_connection_id: string;
  mcp_api_key_encrypted: string;
  webhook_active: number;
  webhook_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function createBotConnection(
  db: D1Database,
  userId: string,
  platform: string,
  name: string,
  botTokenEncrypted: string,
  channelSecretEncrypted: string | null,
  aiConnectionId: string,
  mcpApiKeyEncrypted: string
): Promise<BotConnectionRecord> {
  const id = generateUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO bot_connections (id, user_id, platform, name, bot_token_encrypted, channel_secret_encrypted, ai_connection_id, mcp_api_key_encrypted, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
    )
    .bind(id, userId, platform, name, botTokenEncrypted, channelSecretEncrypted, aiConnectionId, mcpApiKeyEncrypted, now, now)
    .run();

  return {
    id,
    user_id: userId,
    platform: platform as 'telegram' | 'line',
    name,
    bot_token_encrypted: botTokenEncrypted,
    channel_secret_encrypted: channelSecretEncrypted,
    ai_connection_id: aiConnectionId,
    mcp_api_key_encrypted: mcpApiKeyEncrypted,
    webhook_active: 0,
    webhook_url: null,
    status: 'active',
    created_at: now,
    updated_at: now,
  };
}

export async function getBotConnectionsByUserId(
  db: D1Database,
  userId: string
): Promise<BotConnectionRecord[]> {
  const result = await db
    .prepare('SELECT * FROM bot_connections WHERE user_id = ? AND status = ?')
    .bind(userId, 'active')
    .all<BotConnectionRecord>();
  return result.results || [];
}

export async function getBotConnectionById(
  db: D1Database,
  id: string
): Promise<BotConnectionRecord | null> {
  return db
    .prepare('SELECT * FROM bot_connections WHERE id = ?')
    .bind(id)
    .first<BotConnectionRecord>();
}

export async function getBotConnectionByUserAndPlatform(
  db: D1Database,
  userId: string,
  platform: string
): Promise<BotConnectionRecord | null> {
  return db
    .prepare('SELECT * FROM bot_connections WHERE user_id = ? AND platform = ? AND status = ?')
    .bind(userId, platform, 'active')
    .first<BotConnectionRecord>();
}

export async function updateBotConnectionWebhook(
  db: D1Database,
  id: string,
  webhookActive: boolean,
  webhookUrl: string | null
): Promise<void> {
  await db
    .prepare('UPDATE bot_connections SET webhook_active = ?, webhook_url = ?, updated_at = ? WHERE id = ?')
    .bind(webhookActive ? 1 : 0, webhookUrl, new Date().toISOString(), id)
    .run();
}

export async function deleteBotConnection(
  db: D1Database,
  id: string
): Promise<void> {
  await db.prepare('DELETE FROM bot_connections WHERE id = ?').bind(id).run();
}
