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
  getConnectionById,
  updateApiKeyLastUsed,
  getPlan,
  getCurrentDate,
  getCurrentMinuteKey,
  getDailyUsage,
  getMinuteUsage,
  incrementDailyUsage,
  incrementMinuteUsage,
  incrementMonthlyUsage,
  logUsage,
  getCurrentYearMonth,
  updateConnectionLastUsed,
  incrementPlatformStat,
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

      const connection = await getConnectionById(env.DB, apiKeyRecord.connection_id);
      if (!connection || connection.status !== 'active') return json({ error: 'Connection inactive or deleted' }, 401);

      cachedData = {
        user_id: user.id,
        email: user.email,
        plan: user.plan,
        connection_id: connection.id,
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

    await Promise.all([
      incrementMinuteUsage(env.RATE_LIMIT_KV, body.user_id, minuteKey),
      incrementDailyUsage(env.RATE_LIMIT_KV, body.user_id, today),
      incrementMonthlyUsage(env.DB, body.user_id, yearMonth, isSuccess),
      logUsage(env.DB, body.user_id, body.api_key_id, body.connection_id, body.tool_name, body.status, body.response_time_ms, body.error_message || null),
      updateConnectionLastUsed(env.DB, body.connection_id),
      incrementPlatformStat(env.DB, 'total_executions'),
      isSuccess ? incrementPlatformStat(env.DB, 'total_successes') : Promise.resolve(),
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
