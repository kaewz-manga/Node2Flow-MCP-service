/**
 * User Database Operations
 * User CRUD, TOTP, account lifecycle, deletion
 */

import { User } from '../types/platform';
import { generateUUID } from '../crypto-utils';

// ============================================
// User CRUD
// ============================================

export async function createUser(
  db: D1Database,
  email: string,
  passwordHash: string,
  oauthProvider?: string,
  oauthId?: string,
  avatarUrl?: string | null
): Promise<User> {
  const id = generateUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO users (id, email, password_hash, oauth_provider, oauth_id, avatar_url, plan, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'free', 'active', ?, ?)`
    )
    .bind(id, email.toLowerCase(), passwordHash, oauthProvider || null, oauthId || null, avatarUrl || null, now, now)
    .run();

  return {
    id,
    email: email.toLowerCase(),
    password_hash: passwordHash,
    oauth_provider: oauthProvider,
    oauth_id: oauthId,
    avatar_url: avatarUrl || null,
    plan: 'free',
    status: 'active',
    stripe_customer_id: null,
    session_duration_seconds: 86400,
    created_at: now,
    updated_at: now,
  };
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE email = ? AND status != ?')
    .bind(email.toLowerCase(), 'deleted')
    .first<User>();

  return result || null;
}

export async function getUserByEmailIncludingDeleted(db: D1Database, email: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email.toLowerCase())
    .first<User>();

  return result || null;
}

export async function reactivateUser(
  db: D1Database,
  userId: string,
  oauthProvider: string,
  oauthId: string,
  avatarUrl?: string | null
): Promise<void> {
  await db
    .prepare(
      `UPDATE users SET status = 'active', oauth_provider = ?, oauth_id = ?, avatar_url = ?,
       scheduled_deletion_at = NULL, updated_at = ? WHERE id = ?`
    )
    .bind(oauthProvider, oauthId, avatarUrl || null, new Date().toISOString(), userId)
    .run();
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE id = ? AND status != ?')
    .bind(id, 'deleted')
    .first<User>();

  return result || null;
}

export async function updateUserPlan(
  db: D1Database,
  userId: string,
  plan: string
): Promise<void> {
  await db
    .prepare('UPDATE users SET plan = ?, updated_at = ? WHERE id = ?')
    .bind(plan, new Date().toISOString(), userId)
    .run();
}

export async function updateUserStripeCustomerId(
  db: D1Database,
  userId: string,
  stripeCustomerId: string
): Promise<void> {
  await db
    .prepare('UPDATE users SET stripe_customer_id = ?, updated_at = ? WHERE id = ?')
    .bind(stripeCustomerId, new Date().toISOString(), userId)
    .run();
}

export async function getUserByStripeCustomerId(
  db: D1Database,
  stripeCustomerId: string
): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE stripe_customer_id = ? AND status != ?')
    .bind(stripeCustomerId, 'deleted')
    .first<User>();

  return result || null;
}

export async function updateUserPassword(
  db: D1Database,
  userId: string,
  passwordHash: string
): Promise<void> {
  await db
    .prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
    .bind(passwordHash, new Date().toISOString(), userId)
    .run();
}

export async function updateSessionDuration(
  db: D1Database,
  userId: string,
  seconds: number
): Promise<void> {
  await db
    .prepare('UPDATE users SET session_duration_seconds = ?, updated_at = ? WHERE id = ?')
    .bind(seconds, new Date().toISOString(), userId)
    .run();
}

export async function updateUserOAuthScope(
  db: D1Database,
  userId: string,
  scopeJson: string | null
): Promise<void> {
  await db
    .prepare('UPDATE users SET oauth_scope = ?, updated_at = ? WHERE id = ?')
    .bind(scopeJson, new Date().toISOString(), userId)
    .run();
}

export async function deleteUser(db: D1Database, userId: string): Promise<void> {
  await db
    .prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?')
    .bind('deleted', new Date().toISOString(), userId)
    .run();

  await db
    .prepare('UPDATE api_keys SET status = ? WHERE user_id = ?')
    .bind('revoked', userId)
    .run();

  // Note: connections live in Gateway's products-db, not platform-db
  // Gateway handles connection cleanup separately
}

// ============================================
// TOTP Operations
// ============================================

export async function setUserTOTPSecret(
  db: D1Database,
  userId: string,
  totpSecretEncrypted: string
): Promise<void> {
  await db
    .prepare('UPDATE users SET totp_secret_encrypted = ?, updated_at = ? WHERE id = ?')
    .bind(totpSecretEncrypted, new Date().toISOString(), userId)
    .run();
}

export async function enableUserTOTP(
  db: D1Database,
  userId: string
): Promise<void> {
  await db
    .prepare('UPDATE users SET totp_enabled = 1, updated_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), userId)
    .run();
}

export async function disableUserTOTP(
  db: D1Database,
  userId: string
): Promise<void> {
  await db
    .prepare('UPDATE users SET totp_enabled = 0, totp_secret_encrypted = NULL, updated_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), userId)
    .run();
}

export async function getUserTOTPStatus(
  db: D1Database,
  userId: string
): Promise<{ enabled: boolean; hasSecret: boolean }> {
  const result = await db
    .prepare('SELECT totp_enabled, totp_secret_encrypted FROM users WHERE id = ?')
    .bind(userId)
    .first<{ totp_enabled: number; totp_secret_encrypted: string | null }>();

  return {
    enabled: result?.totp_enabled === 1,
    hasSecret: !!result?.totp_secret_encrypted,
  };
}

// ============================================
// Account Recovery (grace period)
// ============================================

export async function scheduleUserDeletion(db: D1Database, userId: string): Promise<string> {
  const deletionDate = new Date(Date.now() + 14 * 86400000).toISOString();
  await db
    .prepare('UPDATE users SET status = ?, scheduled_deletion_at = ?, updated_at = ? WHERE id = ?')
    .bind('pending_deletion', deletionDate, new Date().toISOString(), userId)
    .run();

  await db
    .prepare('UPDATE api_keys SET status = ? WHERE user_id = ?')
    .bind('revoked', userId)
    .run();

  return deletionDate;
}

export async function cancelUserDeletion(db: D1Database, userId: string): Promise<void> {
  await db
    .prepare('UPDATE users SET status = ?, scheduled_deletion_at = NULL, updated_at = ? WHERE id = ?')
    .bind('active', new Date().toISOString(), userId)
    .run();
}

export async function getUsersScheduledForDeletion(db: D1Database): Promise<{ id: string; email: string }[]> {
  const now = new Date().toISOString();
  const result = await db
    .prepare('SELECT id, email FROM users WHERE scheduled_deletion_at <= ? AND status = ?')
    .bind(now, 'pending_deletion')
    .all<{ id: string; email: string }>();

  return result.results || [];
}

export async function hardDeleteUser(db: D1Database, userId: string): Promise<void> {
  await db.prepare('DELETE FROM usage_logs WHERE user_id = ?').bind(userId).run();
  await db.prepare('DELETE FROM usage_monthly WHERE user_id = ?').bind(userId).run();
  await db.prepare('DELETE FROM api_keys WHERE user_id = ?').bind(userId).run();
  await db.prepare('DELETE FROM bot_connections WHERE user_id = ?').bind(userId).run();
  await db.prepare('DELETE FROM ai_connections WHERE user_id = ?').bind(userId).run();
  // Note: connections live in Gateway's products-db, not platform-db
  await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
}
