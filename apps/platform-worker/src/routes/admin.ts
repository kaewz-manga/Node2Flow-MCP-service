/**
 * Admin Routes: Stats, User Management, Analytics, Feedback, System Controls
 */

import type { Env } from '../types';
import { apiResponse } from '../helpers';
import {
  verifyAdminToken,
  hasSudoSession,
  getUserById,
  getApiKeysByUserId,
  getOrCreateMonthlyUsage,
  getCurrentYearMonth,
  getAllUsers,
  updateUserStatus,
  adminUpdateUserPlan,
  logAdminAction,
  deleteUser,
  getAdminStats,
  getUsageTimeseries,
  getTopTools,
  getTopToolsByProduct,
  getTopUsers,
  getUsageByProduct,
  getPlanDistribution,
  getRecentErrors,
  getErrorTrend,
  getAllFeedback,
  updateFeedbackStatus,
  recalculateUsageMonthly,
  recalculatePlatformStats,
  clearAllLogs,
  fullSystemReset,
  getMaintenanceMode,
  setMaintenanceMode,
} from '@node2flow/platform-core';

export async function handleAdminRoutes(
  request: Request,
  env: Env,
  path: string
): Promise<Response | null> {
  const method = request.method;

  const admin = await verifyAdminToken(request, env.JWT_SECRET, env.DB);
  if (!admin) {
    return apiResponse({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, 403);
  }

  // GET /api/admin/stats
  if (path === '/api/admin/stats' && method === 'GET') {
    const stats = await getAdminStats(env.DB);
    return apiResponse({ success: true, data: stats });
  }

  // GET /api/admin/users
  if (path === '/api/admin/users' && method === 'GET') {
    const params = new URL(request.url).searchParams;
    const result = await getAllUsers(env.DB, {
      limit: parseInt(params.get('limit') || '20'),
      offset: parseInt(params.get('offset') || '0'),
      plan: params.get('plan') || undefined,
      status: params.get('status') || undefined,
      search: params.get('search') || undefined,
    });
    return apiResponse({ success: true, data: result });
  }

  // GET /api/admin/users/:id
  const userDetailMatch = path.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (userDetailMatch && method === 'GET') {
    const user = await getUserById(env.DB, userDetailMatch[1]);
    if (!user) return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
    const apiKeys = await getApiKeysByUserId(env.DB, userDetailMatch[1]);
    const yearMonth = getCurrentYearMonth();
    const usage = await getOrCreateMonthlyUsage(env.DB, userDetailMatch[1], yearMonth);
    return apiResponse({
      success: true,
      data: {
        user: { id: user.id, email: user.email, plan: user.plan, status: user.status, is_admin: (user as any).is_admin || 0, created_at: user.created_at },
        api_keys: apiKeys.map((k: any) => ({ id: k.id, connection_id: k.connection_id, prefix: k.key_prefix, name: k.name, status: k.status, last_used_at: k.last_used_at })),
        usage: { request_count: usage.request_count, success_count: usage.success_count, error_count: usage.error_count },
      },
    });
  }

  // PUT /api/admin/users/:id/plan
  const planMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/plan$/);
  if (planMatch && method === 'PUT') {
    const body = await request.json() as { plan: string };
    if (!['free', 'pro', 'enterprise'].includes(body.plan)) return apiResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid plan' } }, 400);
    await adminUpdateUserPlan(env.DB, planMatch[1], body.plan);
    await logAdminAction(env.DB, admin.userId, 'change_plan', planMatch[1], { plan: body.plan });
    return apiResponse({ success: true, data: { message: 'Plan updated' } });
  }

  // PUT /api/admin/users/:id/status
  const statusMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/status$/);
  if (statusMatch && method === 'PUT') {
    const body = await request.json() as { status: string };
    if (!['active', 'suspended'].includes(body.status)) return apiResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid status' } }, 400);
    if (statusMatch[1] === admin.userId) return apiResponse({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot change own status' } }, 403);
    await updateUserStatus(env.DB, statusMatch[1], body.status);
    await logAdminAction(env.DB, admin.userId, 'change_status', statusMatch[1], { status: body.status });
    return apiResponse({ success: true, data: { message: 'Status updated' } });
  }

  // DELETE /api/admin/users/:id
  const deleteMatch = path.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (deleteMatch && method === 'DELETE') {
    if (deleteMatch[1] === admin.userId) return apiResponse({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot delete own account' } }, 403);
    await deleteUser(env.DB, deleteMatch[1]);
    await logAdminAction(env.DB, admin.userId, 'delete_user', deleteMatch[1], {});
    return apiResponse({ success: true, data: { message: 'User deleted' } });
  }

  // Analytics
  if (path === '/api/admin/analytics/usage' && method === 'GET') {
    const days = parseInt(new URL(request.url).searchParams.get('days') || '30');
    const timeseries = await getUsageTimeseries(env.DB, days);
    return apiResponse({ success: true, data: { timeseries } });
  }
  if (path === '/api/admin/analytics/tools' && method === 'GET') {
    const params = new URL(request.url).searchParams;
    const days = parseInt(params.get('days') || '30');
    const limit = parseInt(params.get('limit') || '10');
    const product = params.get('product') || undefined;
    const tools = product
      ? await getTopToolsByProduct(env.DB, product, days, limit)
      : await getTopTools(env.DB, days, limit);
    return apiResponse({ success: true, data: { tools } });
  }
  if (path === '/api/admin/analytics/by-product' && method === 'GET') {
    const days = parseInt(new URL(request.url).searchParams.get('days') || '30');
    const products = await getUsageByProduct(env.DB, days);
    return apiResponse({ success: true, data: { products } });
  }
  if (path === '/api/admin/analytics/top-users' && method === 'GET') {
    const params = new URL(request.url).searchParams;
    const users = await getTopUsers(env.DB, parseInt(params.get('days') || '30'), parseInt(params.get('limit') || '10'));
    return apiResponse({ success: true, data: { users } });
  }
  if (path === '/api/admin/revenue/overview' && method === 'GET') {
    const distribution = await getPlanDistribution(env.DB);
    const mrr = distribution.reduce((sum: number, row: any) => sum + row.count * row.price_monthly, 0);
    return apiResponse({ success: true, data: { mrr: Math.round(mrr * 100) / 100, plan_distribution: distribution } });
  }
  if (path === '/api/admin/health/errors' && method === 'GET') {
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '50');
    const errors = await getRecentErrors(env.DB, limit);
    return apiResponse({ success: true, data: { errors } });
  }
  if (path === '/api/admin/health/error-trend' && method === 'GET') {
    const days = parseInt(new URL(request.url).searchParams.get('days') || '30');
    const trend = await getErrorTrend(env.DB, days);
    return apiResponse({ success: true, data: { trend } });
  }

  // Feedback
  if (path === '/api/admin/feedback' && method === 'GET') {
    const params = new URL(request.url).searchParams;
    const result = await getAllFeedback(env.DB, { limit: parseInt(params.get('limit') || '20'), offset: parseInt(params.get('offset') || '0'), status: params.get('status') || undefined, category: params.get('category') || undefined });
    return apiResponse({ success: true, data: result });
  }
  const feedbackUpdateMatch = path.match(/^\/api\/admin\/feedback\/([^/]+)$/);
  if (feedbackUpdateMatch && method === 'PUT') {
    const body = await request.json() as { status?: string; admin_notes?: string };
    if (body.status && !['new', 'reviewed', 'resolved', 'archived'].includes(body.status)) return apiResponse({ success: false, error: { code: 'INVALID_STATUS', message: 'Status must be new, reviewed, resolved, or archived' } }, 400);
    await updateFeedbackStatus(env.DB, feedbackUpdateMatch[1], body.status || 'reviewed', body.admin_notes);
    return apiResponse({ success: true, data: { message: 'Feedback updated' } });
  }

  // System Controls
  if (path === '/api/admin/system/recalculate-stats' && method === 'POST') {
    const body = await request.json() as { confirmation?: string };
    if (body.confirmation !== 'CONFIRM') return apiResponse({ success: false, error: { code: 'CONFIRMATION_REQUIRED', message: 'Type CONFIRM to proceed' } }, 400);
    const [monthlyResult, statsResult] = await Promise.all([recalculateUsageMonthly(env.DB), recalculatePlatformStats(env.DB)]);
    await logAdminAction(env.DB, admin.userId, 'recalculate_stats', null, { monthly: monthlyResult, stats: statsResult });
    return apiResponse({ success: true, data: { message: 'Stats recalculated successfully', usage_monthly: monthlyResult, platform_stats: statsResult } });
  }
  if (path === '/api/admin/system/clear-logs' && method === 'POST') {
    const sudoStatus = await hasSudoSession(env.RATE_LIMIT_KV, admin.userId);
    if (!sudoStatus.active) return apiResponse({ success: false, error: { code: 'SUDO_REQUIRED', message: 'Security verification required' } }, 403);
    const body = await request.json() as { confirmation?: string };
    if (body.confirmation !== 'CONFIRM') return apiResponse({ success: false, error: { code: 'CONFIRMATION_REQUIRED', message: 'Type CONFIRM to proceed' } }, 400);
    const result = await clearAllLogs(env.DB);
    await logAdminAction(env.DB, admin.userId, 'clear_logs', null, result);
    return apiResponse({ success: true, data: { message: 'All logs cleared', ...result } });
  }
  if (path === '/api/admin/system/full-reset' && method === 'POST') {
    const sudoStatus = await hasSudoSession(env.RATE_LIMIT_KV, admin.userId);
    if (!sudoStatus.active) return apiResponse({ success: false, error: { code: 'SUDO_REQUIRED', message: 'Security verification required' } }, 403);
    const body = await request.json() as { confirmation?: string };
    if (body.confirmation !== 'FULL RESET') return apiResponse({ success: false, error: { code: 'CONFIRMATION_REQUIRED', message: 'Type FULL RESET to proceed' } }, 400);
    const result = await fullSystemReset(env.DB);
    await logAdminAction(env.DB, admin.userId, 'full_system_reset', null, result);
    return apiResponse({ success: true, data: { message: 'Full system reset completed', ...result } });
  }
  if (path === '/api/admin/system/maintenance' && method === 'GET') {
    const state = await getMaintenanceMode(env.RATE_LIMIT_KV);
    return apiResponse({ success: true, data: state });
  }
  if (path === '/api/admin/system/maintenance' && method === 'POST') {
    const sudoStatus = await hasSudoSession(env.RATE_LIMIT_KV, admin.userId);
    if (!sudoStatus.active) return apiResponse({ success: false, error: { code: 'SUDO_REQUIRED', message: 'Security verification required' } }, 403);
    const body = await request.json() as { enabled: boolean; message?: string };
    if (typeof body.enabled !== 'boolean') return apiResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: 'enabled must be a boolean' } }, 400);
    const state = await setMaintenanceMode(env.RATE_LIMIT_KV, body.enabled, admin.userId, body.message);
    await logAdminAction(env.DB, admin.userId, body.enabled ? 'enable_maintenance' : 'disable_maintenance', null, { message: body.message });
    return apiResponse({ success: true, data: { ...state, status_message: body.enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled' } });
  }

  return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Admin endpoint not found' } }, 404);
}
