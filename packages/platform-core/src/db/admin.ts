/**
 * Admin Database Operations
 * Admin queries, stats, system controls, feedback, maintenance, data export
 */

import { Feedback, ExportData, MaintenanceState } from '../types/platform';
import { generateUUID } from '../crypto-utils';

// ============================================
// Admin User Management
// ============================================

export async function getAllUsers(
  db: D1Database,
  options: { limit: number; offset: number; plan?: string; status?: string; search?: string }
): Promise<{ users: unknown[]; total: number }> {
  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (options.status) {
    conditions.push('status = ?');
    binds.push(options.status);
  }
  if (options.plan) {
    conditions.push('plan = ?');
    binds.push(options.plan);
  }
  if (options.search) {
    conditions.push('email LIKE ?');
    binds.push(`%${options.search}%`);
  }

  const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM users${where}`)
    .bind(...binds)
    .first<{ total: number }>();

  const dataResult = await db
    .prepare(`SELECT id, email, plan, status, is_admin, stripe_customer_id, oauth_provider, created_at, updated_at FROM users${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...binds, options.limit, options.offset)
    .all();

  return { users: dataResult.results || [], total: countResult?.total || 0 };
}

export async function updateUserStatus(db: D1Database, userId: string, status: string): Promise<void> {
  await db
    .prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?')
    .bind(status, new Date().toISOString(), userId)
    .run();
}

export async function adminUpdateUserPlan(db: D1Database, userId: string, plan: string): Promise<void> {
  await db
    .prepare('UPDATE users SET plan = ?, updated_at = ? WHERE id = ?')
    .bind(plan, new Date().toISOString(), userId)
    .run();
}

export async function logAdminAction(
  db: D1Database,
  adminUserId: string,
  action: string,
  targetUserId: string | null,
  details: unknown
): Promise<void> {
  const id = generateUUID();
  await db
    .prepare('INSERT INTO admin_logs (id, admin_user_id, action, target_user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, adminUserId, action, targetUserId, JSON.stringify(details), new Date().toISOString())
    .run();
}

// ============================================
// Admin Stats & Analytics
// ============================================

export async function getAdminStats(db: D1Database): Promise<{
  total_users: number;
  active_users: number;
  total_requests_today: number;
  error_rate_today: number;
  mrr: number;
}> {
  const today = new Date().toISOString().slice(0, 10);

  const [usersResult, todayUsage, planDistribution] = await Promise.all([
    db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM users")
      .first<{ total: number; active: number }>(),
    db.prepare(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors FROM usage_logs WHERE created_at >= ?"
    ).bind(today).first<{ total: number; errors: number }>(),
    db.prepare(
      "SELECT u.plan, COUNT(*) as count, p.price_monthly FROM users u JOIN plans p ON u.plan = p.id WHERE u.status = 'active' GROUP BY u.plan"
    ).all<{ plan: string; count: number; price_monthly: number }>(),
  ]);

  const mrr = (planDistribution.results || []).reduce(
    (sum, row) => sum + row.count * row.price_monthly, 0
  );

  return {
    total_users: usersResult?.total || 0,
    active_users: usersResult?.active || 0,
    total_requests_today: todayUsage?.total || 0,
    error_rate_today: todayUsage?.total ? Math.round(((todayUsage?.errors || 0) / todayUsage.total) * 100) : 0,
    mrr: Math.round(mrr * 100) / 100,
  };
}

export async function getUsageTimeseries(
  db: D1Database,
  days: number = 30
): Promise<{ date: string; requests: number; errors: number }[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const result = await db.prepare(
    "SELECT DATE(created_at) as date, COUNT(*) as requests, SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors FROM usage_logs WHERE created_at >= ? GROUP BY DATE(created_at) ORDER BY date"
  ).bind(since).all<{ date: string; requests: number; errors: number }>();
  return result.results || [];
}

export async function getTopTools(
  db: D1Database,
  days: number = 30,
  limit: number = 10
): Promise<{ tool_name: string; count: number; error_count: number; avg_response_ms: number }[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const result = await db.prepare(
    "SELECT tool_name, COUNT(*) as count, SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count, AVG(response_time_ms) as avg_response_ms FROM usage_logs WHERE created_at >= ? GROUP BY tool_name ORDER BY count DESC LIMIT ?"
  ).bind(since, limit).all();
  return (result.results || []) as { tool_name: string; count: number; error_count: number; avg_response_ms: number }[];
}

export async function getTopUsers(
  db: D1Database,
  days: number = 30,
  limit: number = 10
): Promise<{ user_id: string; email: string; request_count: number }[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const result = await db.prepare(
    "SELECT ul.user_id, u.email, COUNT(*) as request_count FROM usage_logs ul JOIN users u ON ul.user_id = u.id WHERE ul.created_at >= ? GROUP BY ul.user_id ORDER BY request_count DESC LIMIT ?"
  ).bind(since, limit).all();
  return (result.results || []) as { user_id: string; email: string; request_count: number }[];
}

export async function getRecentErrors(
  db: D1Database,
  limit: number = 50
): Promise<unknown[]> {
  const result = await db.prepare(
    "SELECT ul.id, ul.user_id, u.email, ul.tool_name, ul.error_message, ul.response_time_ms, ul.created_at FROM usage_logs ul JOIN users u ON ul.user_id = u.id WHERE ul.status = 'error' ORDER BY ul.created_at DESC LIMIT ?"
  ).bind(limit).all();
  return result.results || [];
}

export async function getPlanDistribution(db: D1Database): Promise<{ plan: string; count: number; price_monthly: number }[]> {
  const result = await db.prepare(
    "SELECT u.plan, COUNT(*) as count, p.price_monthly FROM users u JOIN plans p ON u.plan = p.id WHERE u.status = 'active' GROUP BY u.plan"
  ).all();
  return (result.results || []) as { plan: string; count: number; price_monthly: number }[];
}

export async function getErrorTrend(
  db: D1Database,
  days: number = 30
): Promise<{ date: string; count: number }[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const result = await db.prepare(
    "SELECT DATE(created_at) as date, COUNT(*) as count FROM usage_logs WHERE status = 'error' AND created_at >= ? GROUP BY DATE(created_at) ORDER BY date"
  ).bind(since).all();
  return (result.results || []) as { date: string; count: number }[];
}

// ============================================
// Per-Product Analytics
// ============================================

export async function getUsageByProduct(
  db: D1Database,
  days: number = 30
): Promise<{ product: string; requests: number; errors: number; avg_response_ms: number }[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const result = await db.prepare(
    `SELECT
      CASE
        WHEN tool_name LIKE 'n8n_%' THEN 'n8n'
        WHEN tool_name LIKE 'wp_%' THEN 'wordpress'
        WHEN tool_name LIKE 'mcp_%' THEN 'cl-n8n-mcp'
        ELSE 'other'
      END as product,
      COUNT(*) as requests,
      SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
      ROUND(AVG(response_time_ms)) as avg_response_ms
    FROM usage_logs
    WHERE created_at >= ?
    GROUP BY product
    ORDER BY requests DESC`
  ).bind(since).all<{ product: string; requests: number; errors: number; avg_response_ms: number }>();
  return result.results || [];
}

export async function getTopToolsByProduct(
  db: D1Database,
  productType: string,
  days: number = 30,
  limit: number = 10
): Promise<{ tool_name: string; count: number; error_count: number; avg_response_ms: number }[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const prefix = productType === 'n8n' ? 'n8n_%' : productType === 'wordpress' ? 'wp_%' : 'mcp_%';
  const result = await db.prepare(
    "SELECT tool_name, COUNT(*) as count, SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count, ROUND(AVG(response_time_ms)) as avg_response_ms FROM usage_logs WHERE created_at >= ? AND tool_name LIKE ? GROUP BY tool_name ORDER BY count DESC LIMIT ?"
  ).bind(since, prefix, limit).all();
  return (result.results || []) as { tool_name: string; count: number; error_count: number; avg_response_ms: number }[];
}

// ============================================
// System Controls
// ============================================

export async function recalculateUsageMonthly(
  db: D1Database
): Promise<{ rows_created: number }> {
  await db.prepare('DELETE FROM usage_monthly').run();

  const result = await db.prepare(
    `INSERT INTO usage_monthly (id, user_id, year_month, request_count, success_count, error_count, created_at, updated_at)
     SELECT
       lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))),
       user_id,
       strftime('%Y-%m', created_at),
       COUNT(*),
       SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END),
       SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END),
       datetime('now'),
       datetime('now')
     FROM usage_logs
     GROUP BY user_id, strftime('%Y-%m', created_at)`
  ).run();

  return { rows_created: result.meta.changes || 0 };
}

export async function recalculatePlatformStats(
  db: D1Database
): Promise<{ total_users: number; total_executions: number; total_successes: number }> {
  const [usersResult, execResult, successResult] = await Promise.all([
    db.prepare("SELECT COUNT(*) as count FROM users WHERE status != 'deleted'").first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM usage_logs').first<{ count: number }>(),
    db.prepare("SELECT COUNT(*) as count FROM usage_logs WHERE status = 'success'").first<{ count: number }>(),
  ]);

  const total_users = usersResult?.count || 0;
  const total_executions = execResult?.count || 0;
  const total_successes = successResult?.count || 0;

  await db.prepare(
    `INSERT INTO platform_stats (key, value, updated_at) VALUES ('total_users', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')`
  ).bind(total_users, total_users).run();

  await db.prepare(
    `INSERT INTO platform_stats (key, value, updated_at) VALUES ('total_executions', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')`
  ).bind(total_executions, total_executions).run();

  await db.prepare(
    `INSERT INTO platform_stats (key, value, updated_at) VALUES ('total_successes', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')`
  ).bind(total_successes, total_successes).run();

  return { total_users, total_executions, total_successes };
}

export async function clearAllLogs(
  db: D1Database
): Promise<{ usage_logs_deleted: number; usage_monthly_deleted: number }> {
  const logsResult = await db.prepare('DELETE FROM usage_logs').run();
  const monthlyResult = await db.prepare('DELETE FROM usage_monthly').run();

  await db.prepare(
    "UPDATE platform_stats SET value = 0, updated_at = datetime('now') WHERE key IN ('total_executions', 'total_successes')"
  ).run();

  return {
    usage_logs_deleted: logsResult.meta.changes || 0,
    usage_monthly_deleted: monthlyResult.meta.changes || 0,
  };
}

export async function fullSystemReset(
  db: D1Database
): Promise<{
  users_deleted: number;
  connections_deleted: number;
  api_keys_deleted: number;
  ai_connections_deleted: number;
  bot_connections_deleted: number;
  usage_logs_deleted: number;
  usage_monthly_deleted: number;
  admin_logs_deleted: number;
  feedback_deleted: number;
}> {
  const nonAdminUsers = await db.prepare(
    'SELECT id FROM users WHERE is_admin != 1'
  ).all<{ id: string }>();

  const userIds = (nonAdminUsers.results || []).map(u => u.id);
  let connections_deleted = 0;
  let api_keys_deleted = 0;
  let ai_connections_deleted = 0;
  let bot_connections_deleted = 0;

  for (const userId of userIds) {
    const r1 = await db.prepare('DELETE FROM api_keys WHERE user_id = ?').bind(userId).run();
    api_keys_deleted += r1.meta.changes || 0;
    const r2 = await db.prepare('DELETE FROM bot_connections WHERE user_id = ?').bind(userId).run();
    bot_connections_deleted += r2.meta.changes || 0;
    const r3 = await db.prepare('DELETE FROM ai_connections WHERE user_id = ?').bind(userId).run();
    ai_connections_deleted += r3.meta.changes || 0;
    // Note: connections live in Gateway's products-db, not platform-db
    await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
  }

  const logsResult = await db.prepare('DELETE FROM usage_logs').run();
  const monthlyResult = await db.prepare('DELETE FROM usage_monthly').run();
  const adminLogsResult = await db.prepare('DELETE FROM admin_logs').run();
  const feedbackResult = await db.prepare('DELETE FROM feedback').run();

  const adminCount = await db.prepare(
    "SELECT COUNT(*) as count FROM users WHERE status != 'deleted'"
  ).first<{ count: number }>();

  await db.prepare(
    "UPDATE platform_stats SET value = 0, updated_at = datetime('now') WHERE key IN ('total_executions', 'total_successes')"
  ).run();
  await db.prepare(
    `INSERT INTO platform_stats (key, value, updated_at) VALUES ('total_users', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')`
  ).bind(adminCount?.count || 0, adminCount?.count || 0).run();

  return {
    users_deleted: userIds.length,
    connections_deleted,
    api_keys_deleted,
    ai_connections_deleted,
    bot_connections_deleted,
    usage_logs_deleted: logsResult.meta.changes || 0,
    usage_monthly_deleted: monthlyResult.meta.changes || 0,
    admin_logs_deleted: adminLogsResult.meta.changes || 0,
    feedback_deleted: feedbackResult.meta.changes || 0,
  };
}

// ============================================
// Feedback Operations
// ============================================

export async function createFeedback(
  db: D1Database,
  userId: string,
  category: string,
  message: string
): Promise<Feedback> {
  const id = generateUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO feedback (id, user_id, category, message, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'new', ?, ?)`
    )
    .bind(id, userId, category, message, now, now)
    .run();

  return {
    id,
    user_id: userId,
    category: category as Feedback['category'],
    message,
    status: 'new',
    admin_notes: null,
    created_at: now,
    updated_at: now,
  };
}

export async function getFeedbackByUserId(
  db: D1Database,
  userId: string
): Promise<Feedback[]> {
  const result = await db
    .prepare('SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId)
    .all<Feedback>();

  return result.results || [];
}

export async function getAllFeedback(
  db: D1Database,
  options: { limit: number; offset: number; status?: string; category?: string }
): Promise<{ feedback: unknown[]; total: number }> {
  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (options.status) {
    conditions.push('f.status = ?');
    binds.push(options.status);
  }
  if (options.category) {
    conditions.push('f.category = ?');
    binds.push(options.category);
  }

  const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM feedback f${where}`)
    .bind(...binds)
    .first<{ total: number }>();

  const dataResult = await db
    .prepare(
      `SELECT f.*, u.email as user_email FROM feedback f JOIN users u ON f.user_id = u.id${where} ORDER BY f.created_at DESC LIMIT ? OFFSET ?`
    )
    .bind(...binds, options.limit, options.offset)
    .all();

  return { feedback: dataResult.results || [], total: countResult?.total || 0 };
}

export async function updateFeedbackStatus(
  db: D1Database,
  id: string,
  status: string,
  adminNotes?: string
): Promise<void> {
  if (adminNotes !== undefined) {
    await db
      .prepare('UPDATE feedback SET status = ?, admin_notes = ?, updated_at = ? WHERE id = ?')
      .bind(status, adminNotes, new Date().toISOString(), id)
      .run();
  } else {
    await db
      .prepare('UPDATE feedback SET status = ?, updated_at = ? WHERE id = ?')
      .bind(status, new Date().toISOString(), id)
      .run();
  }
}

// ============================================
// Maintenance Mode (KV-based)
// ============================================

export async function getMaintenanceMode(
  kv: KVNamespace
): Promise<MaintenanceState> {
  const value = await kv.get('system:maintenance_mode');
  if (!value) {
    return { enabled: false, enabled_by: null, enabled_at: null, message: null };
  }
  return JSON.parse(value);
}

export async function setMaintenanceMode(
  kv: KVNamespace,
  enabled: boolean,
  adminId: string,
  message?: string
): Promise<MaintenanceState> {
  const state: MaintenanceState = {
    enabled,
    enabled_by: enabled ? adminId : null,
    enabled_at: enabled ? new Date().toISOString() : null,
    message: enabled ? (message || null) : null,
  };
  await kv.put('system:maintenance_mode', JSON.stringify(state));
  return state;
}

// ============================================
// Data Export (GDPR Compliance)
// ============================================

export async function getUserDataForExport(db: D1Database, userId: string): Promise<ExportData | null> {
  const user = await db
    .prepare('SELECT id, email, plan, status, oauth_provider, created_at FROM users WHERE id = ?')
    .bind(userId)
    .first<{ id: string; email: string; plan: string; status: string; oauth_provider: string | null; created_at: string }>();

  if (!user) return null;

  // Note: connections live in Gateway's products-db, not platform-db
  const connections = { results: [] as { id: string; name: string; status: string; created_at: string }[] };

  const apiKeys = await db
    .prepare('SELECT id, connection_id, key_prefix, name, status, last_used_at, created_at FROM api_keys WHERE user_id = ?')
    .bind(userId)
    .all<{ id: string; connection_id: string; key_prefix: string; name: string; status: string; last_used_at: string | null; created_at: string }>();

  const usageMonthly = await db
    .prepare('SELECT year_month, request_count, success_count, error_count FROM usage_monthly WHERE user_id = ? ORDER BY year_month DESC')
    .bind(userId)
    .all<{ year_month: string; request_count: number; success_count: number; error_count: number }>();

  const aiConnections = await db
    .prepare('SELECT id, name, provider_url, model_name, status, created_at FROM ai_connections WHERE user_id = ? AND status = ?')
    .bind(userId, 'active')
    .all<{ id: string; name: string; provider_url: string; model_name: string; status: string; created_at: string }>();

  const botConnections = await db
    .prepare('SELECT id, platform, name, webhook_url, status, created_at FROM bot_connections WHERE user_id = ? AND status = ?')
    .bind(userId, 'active')
    .all<{ id: string; platform: string; name: string; webhook_url: string | null; status: string; created_at: string }>();

  const connectionsWithKeys = (connections.results || []).map(conn => ({
    id: conn.id,
    name: conn.name,
    product_type: 'n8n',
    status: conn.status,
    created_at: conn.created_at,
    api_keys: (apiKeys.results || [])
      .filter(k => k.connection_id === conn.id)
      .map(k => ({
        id: k.id,
        key_prefix: k.key_prefix,
        name: k.name,
        status: k.status,
        last_used_at: k.last_used_at,
        created_at: k.created_at,
      })),
  }));

  return {
    export_date: new Date().toISOString(),
    user,
    connections: connectionsWithKeys,
    usage_monthly: usageMonthly.results || [],
    ai_connections: aiConnections.results || [],
    bot_connections: botConnections.results || [],
  };
}
