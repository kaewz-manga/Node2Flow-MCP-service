/**
 * Internal API Routes - Called by MCP Gateway via Service Binding
 * These endpoints are NOT exposed to the internet - only accessible via Workers Service Binding
 *
 * POST /internal/validate-api-key  → Validate n2f_xxx API key, return user + connection info
 * POST /internal/validate-token    → Validate JWT token, return user info
 * POST /internal/report-usage      → Report tool usage (called via waitUntil)
 * POST /internal/check-limits      → Check rate limits before processing
 */

import type { Env } from '../types';
import {
  hashApiKey,
  getApiKeyByHash,
  getUserById,
  updateApiKeyLastUsed,
  getPlan,
  getCurrentDate,
  getCurrentMinuteKey,
  getDailyUsage,
  getMinuteUsage,
  incrementDailyUsage,
  incrementMinuteUsage,
  getCurrentYearMonth,
  generateUUID,
  verifyJWT,
} from '@node2flow/platform-core';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleInternalRoutes(
  request: Request,
  env: Env,
  path: string
): Promise<Response | null> {
  const method = request.method;

  // POST /internal/validate-api-key
  if (path === '/internal/validate-api-key' && method === 'POST') {
    const body = await request.json() as { api_key: string };
    if (!body.api_key || !body.api_key.startsWith('n2f_')) {
      return json({ error: 'Invalid API key format' }, 400);
    }

    const keyHash = await hashApiKey(body.api_key);

    // Try cache first
    const cacheKey = `apikey:${keyHash}`;
    let cachedData = await env.RATE_LIMIT_KV?.get(cacheKey, 'json') as {
      user_id: string; email: string; plan: string;
      connection_id: string; api_key_id: string;
    } | null;

    if (!cachedData) {
      const apiKeyRecord = await getApiKeyByHash(env.DB, keyHash);
      if (!apiKeyRecord) return json({ error: 'Invalid or revoked API key' }, 401);

      const user = await getUserById(env.DB, apiKeyRecord.user_id);
      if (!user || user.status !== 'active') return json({ error: 'Account suspended or deleted' }, 401);

      // Note: connection existence is validated by Gateway (connections live in Gateway DB)
      cachedData = {
        user_id: user.id,
        email: user.email,
        plan: user.plan,
        connection_id: apiKeyRecord.connection_id,
        api_key_id: apiKeyRecord.id,
      };

      // Cache for 1 hour
      await env.RATE_LIMIT_KV?.put(cacheKey, JSON.stringify(cachedData), { expirationTtl: 3600 });
    }

    // Check rate limits
    const plan = await getPlan(env.DB, cachedData.plan);
    const dailyLimit = plan?.daily_request_limit ?? 100;
    const minuteLimit = plan?.requests_per_minute ?? 50;
    const today = getCurrentDate();
    const minuteKey = getCurrentMinuteKey();

    // Check per-minute rate limit
    if (minuteLimit > 0) {
      const minuteUsage = await getMinuteUsage(env.RATE_LIMIT_KV, cachedData.user_id, minuteKey);
      if (minuteUsage >= minuteLimit) {
        return json({ error: 'Rate limit exceeded (per minute)', limit: minuteLimit, used: minuteUsage, type: 'per_minute' }, 429);
      }
    }

    // Check daily rate limit
    let dailyUsage = 0;
    if (dailyLimit > 0) {
      dailyUsage = await getDailyUsage(env.RATE_LIMIT_KV, cachedData.user_id, today);
      if (dailyUsage >= dailyLimit) {
        return json({ error: 'Daily request limit exceeded', limit: dailyLimit, used: dailyUsage, type: 'daily' }, 429);
      }
    }

    // Update last used (non-blocking)
    updateApiKeyLastUsed(env.DB, cachedData.api_key_id).catch(() => {});

    const isUnlimited = dailyLimit < 0;
    return json({
      user_id: cachedData.user_id,
      email: cachedData.email,
      plan: cachedData.plan,
      connection_id: cachedData.connection_id,
      api_key_id: cachedData.api_key_id,
      usage: {
        current: dailyUsage,
        limit: isUnlimited ? -1 : dailyLimit,
        remaining: isUnlimited ? -1 : (dailyLimit - dailyUsage),
      },
    });
  }

  // POST /internal/validate-token
  if (path === '/internal/validate-token' && method === 'POST') {
    const body = await request.json() as { token: string };
    if (!body.token) return json({ error: 'Token required' }, 400);

    const payload = await verifyJWT(body.token, env.JWT_SECRET);
    if (!payload) return json({ error: 'Invalid or expired token' }, 401);

    return json({
      user_id: payload.sub,
      email: payload.email,
      plan: payload.plan,
      is_admin: payload.is_admin || 0,
    });
  }

  // POST /internal/report-usage
  if (path === '/internal/report-usage' && method === 'POST') {
    const body = await request.json() as {
      user_id: string;
      api_key_id: string;
      connection_id: string;
      tool_name: string;
      status: 'success' | 'error';
      response_time_ms: number;
      error_message?: string;
    };

    const today = getCurrentDate();
    const yearMonth = getCurrentYearMonth();
    const minuteKey = getCurrentMinuteKey();
    const isSuccess = body.status === 'success';
    const now = new Date().toISOString();
    const logId = generateUUID();
    const successInc = isSuccess ? 1 : 0;
    const errorInc = isSuccess ? 0 : 1;

    // D1 batch = atomic transaction (all succeed or all fail)
    const d1Stmts: D1PreparedStatement[] = [
      env.DB.prepare(
        `UPDATE usage_monthly SET request_count = request_count + 1, success_count = success_count + ?, error_count = error_count + ?, updated_at = ? WHERE user_id = ? AND year_month = ?`
      ).bind(successInc, errorInc, now, body.user_id, yearMonth),
      env.DB.prepare(
        `INSERT INTO usage_logs (id, user_id, api_key_id, connection_id, tool_name, status, response_time_ms, error_message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(logId, body.user_id, body.api_key_id, body.connection_id, body.tool_name, body.status, body.response_time_ms, body.error_message || null, now),
      env.DB.prepare(
        `INSERT INTO platform_stats (key, value, updated_at) VALUES ('total_executions', 1, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = value + 1, updated_at = datetime('now')`
      ),
    ];
    if (isSuccess) {
      d1Stmts.push(
        env.DB.prepare(
          `INSERT INTO platform_stats (key, value, updated_at) VALUES ('total_successes', 1, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = value + 1, updated_at = datetime('now')`
        )
      );
    }

    // Run D1 batch (atomic) + KV rate counters in parallel
    await Promise.all([
      env.DB.batch(d1Stmts),
      incrementMinuteUsage(env.RATE_LIMIT_KV, body.user_id, minuteKey),
      incrementDailyUsage(env.RATE_LIMIT_KV, body.user_id, today),
    ]);

    return json({ received: true });
  }

  // POST /internal/check-limits
  if (path === '/internal/check-limits' && method === 'POST') {
    const body = await request.json() as { user_id: string; plan: string };

    const plan = await getPlan(env.DB, body.plan);
    const dailyLimit = plan?.daily_request_limit ?? 100;
    const minuteLimit = plan?.requests_per_minute ?? 50;
    const today = getCurrentDate();
    const minuteKey = getCurrentMinuteKey();

    const [dailyUsage, minuteUsage] = await Promise.all([
      dailyLimit > 0 ? getDailyUsage(env.RATE_LIMIT_KV, body.user_id, today) : Promise.resolve(0),
      minuteLimit > 0 ? getMinuteUsage(env.RATE_LIMIT_KV, body.user_id, minuteKey) : Promise.resolve(0),
    ]);

    const dailyOk = dailyLimit < 0 || dailyUsage < dailyLimit;
    const minuteOk = minuteLimit < 0 || minuteUsage < minuteLimit;

    return json({
      allowed: dailyOk && minuteOk,
      daily: { used: dailyUsage, limit: dailyLimit, ok: dailyOk },
      minute: { used: minuteUsage, limit: minuteLimit, ok: minuteOk },
    });
  }

  return null;
}
