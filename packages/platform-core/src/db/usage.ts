/**
 * Usage Tracking Operations
 * D1 logging, monthly aggregation, KV rate limiting, platform stats
 */

import { UsageMonthly } from '../types/platform';
import { generateUUID } from '../crypto-utils';

// ============================================
// Usage Logging (D1)
// ============================================

export async function logUsage(
  db: D1Database,
  userId: string,
  apiKeyId: string,
  connectionId: string,
  toolName: string,
  status: 'success' | 'error' | 'rate_limited',
  responseTimeMs: number | null = null,
  errorMessage: string | null = null
): Promise<void> {
  const id = generateUUID();

  await db
    .prepare(
      `INSERT INTO usage_logs (id, user_id, api_key_id, connection_id, tool_name, status, response_time_ms, error_message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, userId, apiKeyId, connectionId, toolName, status, responseTimeMs, errorMessage, new Date().toISOString())
    .run();
}

// ============================================
// Monthly Usage (D1)
// ============================================

export async function getOrCreateMonthlyUsage(
  db: D1Database,
  userId: string,
  yearMonth: string
): Promise<UsageMonthly> {
  let result = await db
    .prepare('SELECT * FROM usage_monthly WHERE user_id = ? AND year_month = ?')
    .bind(userId, yearMonth)
    .first<UsageMonthly>();

  if (result) return result;

  const id = generateUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO usage_monthly (id, user_id, year_month, request_count, success_count, error_count, created_at, updated_at)
       VALUES (?, ?, ?, 0, 0, 0, ?, ?)`
    )
    .bind(id, userId, yearMonth, now, now)
    .run();

  return {
    id,
    user_id: userId,
    year_month: yearMonth,
    request_count: 0,
    success_count: 0,
    error_count: 0,
    created_at: now,
    updated_at: now,
  };
}

export async function incrementMonthlyUsage(
  db: D1Database,
  userId: string,
  yearMonth: string,
  success: boolean
): Promise<void> {
  const successIncrement = success ? 1 : 0;
  const errorIncrement = success ? 0 : 1;

  await db
    .prepare(
      `UPDATE usage_monthly
       SET request_count = request_count + 1,
           success_count = success_count + ?,
           error_count = error_count + ?,
           updated_at = ?
       WHERE user_id = ? AND year_month = ?`
    )
    .bind(successIncrement, errorIncrement, new Date().toISOString(), userId, yearMonth)
    .run();
}

// ============================================
// Daily Usage (KV-based)
// ============================================

export async function getDailyUsage(
  kv: KVNamespace,
  userId: string,
  date: string
): Promise<number> {
  const key = `daily:${userId}:${date}`;
  const value = await kv.get(key);
  return value ? parseInt(value, 10) : 0;
}

export async function incrementDailyUsage(
  kv: KVNamespace,
  userId: string,
  date: string
): Promise<number> {
  const key = `daily:${userId}:${date}`;
  const current = await getDailyUsage(kv, userId, date);
  const newValue = current + 1;
  await kv.put(key, String(newValue), { expirationTtl: 172800 });
  return newValue;
}

// ============================================
// Per-Minute Rate Limiting (KV-based)
// ============================================

export function getCurrentMinuteKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
}

export async function getMinuteUsage(
  kv: KVNamespace,
  userId: string,
  minuteKey: string
): Promise<number> {
  const key = `minute:${userId}:${minuteKey}`;
  const value = await kv.get(key);
  return value ? parseInt(value, 10) : 0;
}

export async function incrementMinuteUsage(
  kv: KVNamespace,
  userId: string,
  minuteKey: string
): Promise<number> {
  const key = `minute:${userId}:${minuteKey}`;
  const current = await getMinuteUsage(kv, userId, minuteKey);
  const newValue = current + 1;
  await kv.put(key, String(newValue), { expirationTtl: 120 });
  return newValue;
}

// ============================================
// Platform Stats (permanent counters)
// ============================================

export async function incrementPlatformStat(
  db: D1Database,
  key: string,
  amount: number = 1
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO platform_stats (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = value + ?, updated_at = datetime('now')`
    )
    .bind(key, amount, amount)
    .run();
}

export async function getPlatformStats(
  db: D1Database
): Promise<{ total_users: number; total_executions: number; total_successes: number; pass_rate: number }> {
  const result = await db
    .prepare('SELECT key, value FROM platform_stats')
    .all<{ key: string; value: number }>();

  const stats: Record<string, number> = {};
  for (const row of result.results || []) {
    stats[row.key] = row.value;
  }

  const totalExec = stats['total_executions'] || 0;
  const totalSuccess = stats['total_successes'] || 0;

  return {
    total_users: stats['total_users'] || 0,
    total_executions: totalExec,
    total_successes: totalSuccess,
    pass_rate: totalExec > 0 ? Math.round((totalSuccess / totalExec) * 10000) / 100 : 0,
  };
}

// ============================================
// Utility Functions
// ============================================

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCurrentDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getNextMonthReset(): string {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return nextMonth.toISOString();
}

export function getTomorrowReset(): string {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.toISOString();
}

// ============================================
// Log Retention (90-day)
// ============================================

export async function deleteOldUsageLogs(db: D1Database, daysOld: number = 90): Promise<number> {
  const cutoffDate = new Date(Date.now() - daysOld * 86400000).toISOString().slice(0, 10);
  const result = await db
    .prepare('DELETE FROM usage_logs WHERE DATE(created_at) < ?')
    .bind(cutoffDate)
    .run();

  return result.meta.changes || 0;
}

export async function getUsageLogsForExport(
  db: D1Database,
  userId: string,
  limit: number = 10000
): Promise<unknown[]> {
  const result = await db
    .prepare('SELECT * FROM usage_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
    .bind(userId, limit)
    .all();

  return result.results || [];
}
