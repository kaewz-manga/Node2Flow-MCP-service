/**
 * User Routes: Profile, Password, Session, Export, Delete, Recover
 * API Keys, AI Connections, Bot Connections, Feedback, Usage
 *
 * NOTE: MCP connection CRUD (create/list/delete) is handled by MCP Gateway Worker.
 * Platform only manages API keys, AI connections, and bot connections.
 */

import type { Env } from '../types';
import { apiResponse, CORS_HEADERS } from '../helpers';
import {
  getUserById,
  updateUserPassword,
  updateSessionDuration,
  updateUserOAuthScope,
  hashPassword,
  verifyPassword,
  generateJWT,
  scheduleUserDeletion,
  cancelUserDeletion,
  hardDeleteUser,
  getUserDataForExport,
  getUsageLogsForExport,
  getApiKeysByUserId,
  generateApiKey,
  createApiKey as createApiKeyDb,
  hashApiKey,
  deleteApiKey,
  deleteAllConnectionApiKeys,
  getOrCreateMonthlyUsage,
  getDailyUsage,
  getMinuteUsage,
  getCurrentYearMonth,
  getCurrentDate,
  getCurrentMinuteKey,
  getTomorrowReset,
  getPlan,
  createFeedback,
  getFeedbackByUserId,
  sendEmail,
  deletionScheduledEmail,
  accountRecoveredEmail,
  // AI connections
  getAiConnectionsByUserId,
  getAiConnectionById,
  deleteAiConnection,
  createAiConnection,
  encrypt,
  decrypt,
  // Bot connections
  getBotConnectionsByUserId,
  getBotConnectionById,
  deleteBotConnection,
  createBotConnection,
  updateBotConnectionWebhook,
} from '@node2flow/platform-core';

export async function handleUserRoutes(
  request: Request,
  env: Env,
  path: string,
  authUser: { userId: string; email: string; plan: string; is_admin: number },
  ctx: ExecutionContext
): Promise<Response | null> {
  const method = request.method;

  // GET /api/user/profile
  if (path === '/api/user/profile' && method === 'GET') {
    const user = await getUserById(env.DB, authUser.userId);
    if (!user) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
    return apiResponse({
      success: true,
      data: {
        id: user.id, email: user.email, plan: user.plan, status: user.status,
        is_admin: (user as any).is_admin || 0,
        session_duration_seconds: (user as any).session_duration_seconds || 86400,
        created_at: user.created_at, oauth_provider: user.oauth_provider || null,
        scheduled_deletion_at: user.scheduled_deletion_at || null,
        avatar_url: (user as any).avatar_url || null,
      },
    });
  }

  // PUT /api/user/session-duration
  if (path === '/api/user/session-duration' && method === 'PUT') {
    const body = await request.json() as { duration: number };
    const validDurations = [3600, 86400, 604800, 2592000];
    if (!validDurations.includes(body.duration)) {
      return apiResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Duration must be 3600, 86400, 604800, or 2592000 seconds' } }, 400);
    }
    await updateSessionDuration(env.DB, authUser.userId, body.duration);
    const token = await generateJWT({ sub: authUser.userId, email: authUser.email, plan: authUser.plan, is_admin: authUser.is_admin }, env.JWT_SECRET, body.duration);
    return apiResponse({ success: true, data: { message: 'Session duration updated', token, duration: body.duration } });
  }

  // GET /api/user/oauth-scope
  if (path === '/api/user/oauth-scope' && method === 'GET') {
    const user = await getUserById(env.DB, authUser.userId);
    if (!user) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
    let scope = null;
    if (user.oauth_scope) { try { scope = JSON.parse(user.oauth_scope); } catch { /* corrupt → null */ } }
    return apiResponse({ success: true, data: { scope } });
  }

  // PUT /api/user/oauth-scope
  if (path === '/api/user/oauth-scope' && method === 'PUT') {
    const body = await request.json() as { scope: { plugins?: string[]; permissions?: string[] } | null };
    const scopeJson = body.scope ? JSON.stringify(body.scope) : null;
    await updateUserOAuthScope(env.DB, authUser.userId, scopeJson);
    return apiResponse({ success: true, data: { message: 'OAuth scope updated' } });
  }

  // PUT /api/user/password
  if (path === '/api/user/password' && method === 'PUT') {
    const body = await request.json() as { current_password: string; new_password: string };
    if (!body.current_password || !body.new_password) return apiResponse({ success: false, error: { code: 'INVALID_REQUEST', message: 'Current and new password required' } }, 400);
    if (body.new_password.length < 8) return apiResponse({ success: false, error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' } }, 400);
    const user = await getUserById(env.DB, authUser.userId);
    if (!user) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
    if (user.oauth_provider && !user.password_hash) return apiResponse({ success: false, error: { code: 'OAUTH_USER', message: 'OAuth users cannot change password' } }, 400);
    const validPassword = await verifyPassword(body.current_password, user.password_hash || '');
    if (!validPassword) return apiResponse({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } }, 401);
    const newHash = await hashPassword(body.new_password);
    await updateUserPassword(env.DB, authUser.userId, newHash);
    return apiResponse({ success: true, data: { message: 'Password updated successfully' } });
  }

  // GET /api/user/export
  if (path === '/api/user/export' && method === 'GET') {
    const reqUrl = new URL(request.url);
    const format = reqUrl.searchParams.get('format') || 'json';
    if (format !== 'json' && format !== 'csv') return apiResponse({ success: false, error: { code: 'INVALID_FORMAT', message: 'Format must be json or csv' } }, 400);
    const exportData = await getUserDataForExport(env.DB, authUser.userId);
    if (!exportData) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
    if (format === 'json') {
      const usageLogs = await getUsageLogsForExport(env.DB, authUser.userId);
      const fullExport = { ...exportData, usage_logs: usageLogs };
      return new Response(JSON.stringify(fullExport, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="n2f-export-${new Date().toISOString().slice(0, 10)}.json"`, ...CORS_HEADERS },
      });
    } else {
      const usageLogs = await getUsageLogsForExport(env.DB, authUser.userId);
      const csvHeader = 'id,user_id,api_key_id,connection_id,tool_name,status,response_time_ms,error_message,created_at\n';
      const csvRows = usageLogs.map((log: any) =>
        `${log.id},${log.user_id},${log.api_key_id},${log.connection_id},${log.tool_name},${log.status},${log.response_time_ms || ''},${(log.error_message || '').replace(/,/g, ';').replace(/\n/g, ' ')},${log.created_at}`
      ).join('\n');
      return new Response(csvHeader + csvRows, {
        status: 200,
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="n2f-usage-logs-${new Date().toISOString().slice(0, 10)}.csv"`, ...CORS_HEADERS },
      });
    }
  }

  // DELETE /api/user (schedule deletion)
  if (path === '/api/user' && method === 'DELETE') {
    const body = await request.json().catch(() => ({})) as { password?: string; confirm?: boolean };
    const user = await getUserById(env.DB, authUser.userId);
    if (!user) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
    if (user.password_hash && !user.oauth_provider) {
      if (!body.password) return apiResponse({ success: false, error: { code: 'PASSWORD_REQUIRED', message: 'Password required to delete account' } }, 400);
      const validPassword = await verifyPassword(body.password, user.password_hash);
      if (!validPassword) return apiResponse({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Password is incorrect' } }, 401);
    } else {
      if (!body.confirm) return apiResponse({ success: false, error: { code: 'CONFIRM_REQUIRED', message: 'Confirmation required to delete account' } }, 400);
    }
    const deletionDate = await scheduleUserDeletion(env.DB, authUser.userId);
    ctx.waitUntil(sendEmail(env as any, deletionScheduledEmail(user.email, deletionDate)));
    return apiResponse({ success: true, data: { message: 'Account scheduled for deletion.', scheduled_deletion_at: deletionDate } });
  }

  // POST /api/user/recover
  if (path === '/api/user/recover' && method === 'POST') {
    const user = await getUserById(env.DB, authUser.userId);
    if (!user) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
    if (user.status !== 'pending_deletion') return apiResponse({ success: false, error: { code: 'NOT_PENDING', message: 'Account is not pending deletion' } }, 400);
    await cancelUserDeletion(env.DB, authUser.userId);
    ctx.waitUntil(sendEmail(env as any, accountRecoveredEmail(user.email)));
    return apiResponse({ success: true, data: { message: 'Account recovered successfully.' } });
  }

  // POST /api/user/force-delete
  if (path === '/api/user/force-delete' && method === 'POST') {
    const body = await request.json().catch(() => ({})) as { password?: string; confirm?: boolean };
    const user = await getUserById(env.DB, authUser.userId);
    if (!user) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
    if (user.status !== 'pending_deletion') return apiResponse({ success: false, error: { code: 'NOT_PENDING', message: 'Account must be scheduled for deletion first' } }, 400);
    if (user.password_hash && !user.oauth_provider) {
      if (!body.password) return apiResponse({ success: false, error: { code: 'PASSWORD_REQUIRED', message: 'Password required to force delete' } }, 400);
      const validPassword = await verifyPassword(body.password, user.password_hash);
      if (!validPassword) return apiResponse({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Password is incorrect' } }, 401);
    } else {
      if (!body.confirm) return apiResponse({ success: false, error: { code: 'CONFIRM_REQUIRED', message: 'Confirmation required to force delete' } }, 400);
    }
    await hardDeleteUser(env.DB, authUser.userId);
    return apiResponse({ success: true, data: { message: 'Account permanently deleted' } });
  }

  // ============================================
  // API Keys (connection_id is a reference to Gateway DB)
  // ============================================

  // GET /api/api-keys
  if (path === '/api/api-keys' && method === 'GET') {
    const apiKeys = await getApiKeysByUserId(env.DB, authUser.userId);
    return apiResponse({
      success: true,
      data: {
        api_keys: apiKeys.map((k: any) => {
          let scope = null;
          if (k.scope) { try { scope = JSON.parse(k.scope); } catch { /* corrupt scope */ } }
          return {
            id: k.id, connection_id: k.connection_id, prefix: k.key_prefix,
            name: k.name, scope, status: k.status, expires_at: k.expires_at ?? null, last_used_at: k.last_used_at, created_at: k.created_at,
          };
        }),
      },
    });
  }

  // POST /api/api-keys
  if (path === '/api/api-keys' && method === 'POST') {
    const body = await request.json() as {
      connection_id?: string;
      name?: string;
      scope?: { plugins?: string[]; permissions?: string[] } | null;
      expires_at?: string | null;
    };
    // connection_id is optional: omit or '_all' = access all services
    const connectionId = body.connection_id || '_all';
    const scopeJson = body.scope ? JSON.stringify(body.scope) : null;
    const expiresAt = body.expires_at || null;
    const { key, hash, prefix } = await generateApiKey();
    await createApiKeyDb(env.DB, authUser.userId, connectionId, hash, prefix, body.name || 'API Key', scopeJson, expiresAt);
    return apiResponse({ success: true, data: { api_key: key, prefix, message: 'Save your API key now. It will not be shown again.' } }, 201);
  }

  // DELETE /api/api-keys/connection-keys (bulk revoke all connection keys)
  if (path === '/api/api-keys/connection-keys' && method === 'DELETE') {
    const hashes = await deleteAllConnectionApiKeys(env.DB, authUser.userId);
    await Promise.all(
      hashes.map((h: string) => env.RATE_LIMIT_KV?.delete(`apikey:${h}`).catch(() => {}))
    );
    return apiResponse({ success: true, data: { revoked_count: hashes.length, message: `${hashes.length} connection key(s) revoked` } });
  }

  // DELETE /api/api-keys/:id
  const deleteKeyMatch = path.match(/^\/api\/api-keys\/([^/]+)$/);
  if (deleteKeyMatch && method === 'DELETE') {
    const apiKeys = await getApiKeysByUserId(env.DB, authUser.userId);
    const apiKey = apiKeys.find((k: any) => k.id === deleteKeyMatch[1]);
    if (!apiKey) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'API key not found' } }, 404);
    await deleteApiKey(env.DB, deleteKeyMatch[1]);
    if (apiKey.key_hash) {
      await env.RATE_LIMIT_KV?.delete(`apikey:${apiKey.key_hash}`).catch(() => {});
    }
    return apiResponse({ success: true, data: { message: 'API key revoked' } });
  }

  // ============================================
  // AI Connections (BYOK - lives in Platform DB)
  // ============================================
  if (path === '/api/ai-connections' && method === 'GET') {
    const connections = await getAiConnectionsByUserId(env.DB, authUser.userId);
    return apiResponse({ success: true, data: { connections: connections.map((c: any) => ({ id: c.id, name: c.name, provider_url: c.provider_url, model_name: c.model_name, is_default: c.is_default, status: c.status, created_at: c.created_at })) } });
  }
  if (path === '/api/ai-connections' && method === 'POST') {
    const body = await request.json() as any;
    if (!body.provider_url || !body.api_key || !body.model_name) return apiResponse({ success: false, error: { code: 'MISSING_FIELDS', message: 'provider_url, api_key, and model_name are required' } }, 400);
    const encrypted = await encrypt(body.api_key, env.ENCRYPTION_KEY);
    const conn = await createAiConnection(env.DB, authUser.userId, body.name || 'Default AI', body.provider_url, encrypted, body.model_name);
    return apiResponse({ success: true, data: { connection: { id: conn.id, name: conn.name, provider_url: conn.provider_url, model_name: conn.model_name, status: conn.status, created_at: conn.created_at }, message: 'AI connection created' } });
  }
  const aiConnDelete = path.match(/^\/api\/ai-connections\/([^/]+)$/);
  if (aiConnDelete && method === 'DELETE') {
    const conn = await getAiConnectionById(env.DB, aiConnDelete[1]);
    if (!conn || conn.user_id !== authUser.userId) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'AI connection not found' } }, 404);
    await deleteAiConnection(env.DB, aiConnDelete[1]);
    return apiResponse({ success: true, data: { message: 'AI connection deleted' } });
  }
  const aiConnConfig = path.match(/^\/api\/ai-connections\/([^/]+)\/config$/);
  if (aiConnConfig && method === 'GET') {
    const conn = await getAiConnectionById(env.DB, aiConnConfig[1]);
    if (!conn || conn.user_id !== authUser.userId) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'AI connection not found' } }, 404);
    const apiKey = await decrypt(conn.api_key_encrypted, env.ENCRYPTION_KEY);
    return apiResponse({ success: true, data: { provider_url: conn.provider_url, api_key: apiKey, model_name: conn.model_name } });
  }

  // ============================================
  // Bot Connections (lives in Platform DB)
  // ============================================
  if (path === '/api/bot-connections' && method === 'GET') {
    const connections = await getBotConnectionsByUserId(env.DB, authUser.userId);
    return apiResponse({ success: true, data: { connections: connections.map((c: any) => ({ id: c.id, platform: c.platform, name: c.name, ai_connection_id: c.ai_connection_id, webhook_active: c.webhook_active, webhook_url: c.webhook_url, status: c.status, created_at: c.created_at })) } });
  }
  if (path === '/api/bot-connections' && method === 'POST') {
    const body = await request.json() as any;
    if (!body.platform || !body.bot_token || !body.ai_connection_id || !body.mcp_api_key) return apiResponse({ success: false, error: { code: 'MISSING_FIELDS', message: 'platform, bot_token, ai_connection_id, and mcp_api_key are required' } }, 400);
    if (body.platform !== 'telegram' && body.platform !== 'line') return apiResponse({ success: false, error: { code: 'INVALID_PLATFORM', message: 'platform must be telegram or line' } }, 400);
    if (body.platform === 'line' && !body.channel_secret) return apiResponse({ success: false, error: { code: 'MISSING_FIELDS', message: 'channel_secret is required for LINE' } }, 400);
    const aiConn = await getAiConnectionById(env.DB, body.ai_connection_id);
    if (!aiConn || aiConn.user_id !== authUser.userId || aiConn.status !== 'active') return apiResponse({ success: false, error: { code: 'AI_NOT_FOUND', message: 'AI connection not found' } }, 404);
    const botTokenEnc = await encrypt(body.bot_token, env.ENCRYPTION_KEY);
    const channelSecretEnc = body.channel_secret ? await encrypt(body.channel_secret, env.ENCRYPTION_KEY) : null;
    const mcpKeyEnc = await encrypt(body.mcp_api_key, env.ENCRYPTION_KEY);
    const conn = await createBotConnection(env.DB, authUser.userId, body.platform, body.name || 'My Bot', botTokenEnc, channelSecretEnc, body.ai_connection_id, mcpKeyEnc);
    return apiResponse({ success: true, data: { connection: { id: conn.id, platform: conn.platform, name: conn.name, status: conn.status, created_at: conn.created_at }, message: 'Bot connection created' } });
  }
  const botConnMatch = path.match(/^\/api\/bot-connections\/([^/]+)$/);
  if (botConnMatch && method === 'DELETE') {
    const conn = await getBotConnectionById(env.DB, botConnMatch[1]);
    if (!conn || conn.user_id !== authUser.userId) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Bot connection not found' } }, 404);
    if (conn.webhook_active && conn.platform === 'telegram') {
      try { const botToken = await decrypt(conn.bot_token_encrypted, env.ENCRYPTION_KEY); await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`); } catch { /* best effort */ }
    }
    await deleteBotConnection(env.DB, botConnMatch[1]);
    return apiResponse({ success: true, data: { message: 'Bot connection deleted' } });
  }
  const botWebhookMatch = path.match(/^\/api\/bot-connections\/([^/]+)\/webhook$/);
  if (botWebhookMatch && method === 'POST') {
    const conn = await getBotConnectionById(env.DB, botWebhookMatch[1]);
    if (!conn || conn.user_id !== authUser.userId) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Bot connection not found' } }, 404);
    if (!env.AGENT_URL) return apiResponse({ success: false, error: { code: 'NOT_CONFIGURED', message: 'AGENT_URL not configured' } }, 503);
    const webhookUrl = `${env.AGENT_URL}/api/webhook/${conn.platform}/${conn.user_id}`;
    if (conn.platform === 'telegram') {
      const botToken = await decrypt(conn.bot_token_encrypted, env.ENCRYPTION_KEY);
      const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: webhookUrl }) });
      const result = await res.json() as any;
      if (!result.ok) return apiResponse({ success: false, error: { code: 'TELEGRAM_ERROR', message: result.description || 'Failed to set webhook' } }, 502);
    }
    await updateBotConnectionWebhook(env.DB, conn.id, true, webhookUrl);
    return apiResponse({ success: true, data: { webhook_url: webhookUrl, message: conn.platform === 'line' ? 'Paste this URL in LINE Developer Console' : 'Telegram webhook registered' } });
  }
  if (botWebhookMatch && method === 'DELETE') {
    const conn = await getBotConnectionById(env.DB, botWebhookMatch[1]);
    if (!conn || conn.user_id !== authUser.userId) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Bot connection not found' } }, 404);
    if (conn.platform === 'telegram' && conn.webhook_active) {
      try { const botToken = await decrypt(conn.bot_token_encrypted, env.ENCRYPTION_KEY); await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`); } catch { /* best effort */ }
    }
    await updateBotConnectionWebhook(env.DB, conn.id, false, null);
    return apiResponse({ success: true, data: { message: 'Webhook deregistered' } });
  }

  // ============================================
  // Feedback
  // ============================================
  if (path === '/api/feedback' && method === 'POST') {
    const body = await request.json() as { category?: string; message?: string };
    const validCategories = ['bug', 'feature', 'general', 'question'];
    if (!body.category || !validCategories.includes(body.category)) return apiResponse({ success: false, error: { code: 'INVALID_CATEGORY', message: 'Category must be bug, feature, general, or question' } }, 400);
    if (!body.message || body.message.length < 10 || body.message.length > 2000) return apiResponse({ success: false, error: { code: 'INVALID_MESSAGE', message: 'Message must be between 10 and 2000 characters' } }, 400);
    const feedback = await createFeedback(env.DB, authUser.userId, body.category, body.message);
    return apiResponse({ success: true, data: { feedback } }, 201);
  }
  if (path === '/api/feedback' && method === 'GET') {
    const feedback = await getFeedbackByUserId(env.DB, authUser.userId);
    return apiResponse({ success: true, data: { feedback } });
  }

  // ============================================
  // Usage Stats
  // ============================================
  if (path === '/api/usage' && method === 'GET') {
    const today = getCurrentDate();
    const yearMonth = getCurrentYearMonth();
    const minuteKey = getCurrentMinuteKey();
    const usage = await getOrCreateMonthlyUsage(env.DB, authUser.userId, yearMonth);
    const dailyUsage = await getDailyUsage(env.RATE_LIMIT_KV, authUser.userId, today);
    const minuteUsage = await getMinuteUsage(env.RATE_LIMIT_KV, authUser.userId, minuteKey);
    const freshUser = await getUserById(env.DB, authUser.userId);
    const currentPlanId = freshUser?.plan || authUser.plan;
    const plan = await getPlan(env.DB, currentPlanId);
    const dailyLimit = plan?.daily_request_limit ?? 100;
    const minuteLimit = plan?.requests_per_minute ?? 50;
    const isDailyUnlimited = dailyLimit < 0;
    const isMinuteUnlimited = minuteLimit < 0;
    return apiResponse({
      success: true,
      data: {
        plan: currentPlanId, period: today,
        requests: { used: dailyUsage, limit: isDailyUnlimited ? -1 : dailyLimit, remaining: isDailyUnlimited ? -1 : Math.max(0, dailyLimit - dailyUsage), unlimited: isDailyUnlimited },
        rate_limit: { used: minuteUsage, limit: isMinuteUnlimited ? -1 : minuteLimit, remaining: isMinuteUnlimited ? -1 : Math.max(0, minuteLimit - minuteUsage), unlimited: isMinuteUnlimited },
        monthly: { period: yearMonth, used: usage.request_count, success_count: usage.success_count, error_count: usage.error_count },
        success_rate: usage.request_count > 0 ? Math.round((usage.success_count / usage.request_count) * 100) : 100,
        reset_at: getTomorrowReset(),
      },
    });
  }

  // GET /api/usage/history?months=12
  if (path === '/api/usage/history' && method === 'GET') {
    const reqUrl = new URL(request.url);
    const months = Math.min(Math.max(parseInt(reqUrl.searchParams.get('months') || '12', 10) || 12, 1), 24);
    const rows = await env.DB
      .prepare('SELECT year_month, request_count, success_count, error_count FROM usage_monthly WHERE user_id = ? ORDER BY year_month DESC LIMIT ?')
      .bind(authUser.userId, months)
      .all();
    const history = (rows.results || []).map((r: any) => ({
      year_month: r.year_month,
      requests: r.request_count,
      successes: r.success_count,
      errors: r.error_count,
    })).reverse();
    return apiResponse({ success: true, data: { history } });
  }

  // GET /api/usage/by-connection?days=7|30|90
  if (path === '/api/usage/by-connection' && method === 'GET') {
    const reqUrl = new URL(request.url);
    const days = parseInt(reqUrl.searchParams.get('days') || '7', 10);
    if (![7, 30, 90].includes(days)) {
      return apiResponse({ success: false, error: { code: 'INVALID_DAYS', message: 'days must be 7, 30, or 90' } }, 400);
    }
    const rows = await env.DB
      .prepare(`SELECT connection_id, COUNT(*) as total_requests, SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) as successes, SUM(CASE WHEN status='error' THEN 1 ELSE 0 END) as errors, MAX(created_at) as last_request_at FROM usage_logs WHERE user_id = ? AND created_at >= datetime('now', '-' || ? || ' days') GROUP BY connection_id ORDER BY total_requests DESC`)
      .bind(authUser.userId, days)
      .all();
    return apiResponse({ success: true, data: { connections: rows.results || [], period_days: days } });
  }

  return null;
}
