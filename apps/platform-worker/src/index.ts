/**
 * Node2Flow Platform Worker
 * Central auth, billing, user management, admin panel
 *
 * Routes:
 *   /api/auth/*       → Register, Login, OAuth, TOTP, Sudo
 *   /api/user/*       → Profile, password, connections, AI/Bot connections, feedback, usage
 *   /api/billing/*    → Stripe checkout, portal, webhook
 *   /api/admin/*      → Admin panel APIs
 *   /api/agent/*      → HMAC-authenticated Vercel agent endpoints
 *   /api/plans        → Public plan listing
 *   /api/platform-stats → Public platform stats
 *   /internal/*       → MCP Gateway service binding (not internet-facing)
 */

import type { Env } from './types';
import { CORS_HEADERS, apiResponse } from './helpers';
import { handleAuthRoutes } from './routes/auth';
import { handleUserRoutes } from './routes/user';
import { handleAdminRoutes } from './routes/admin';
import { handleBillingRoutes } from './routes/billing';
import { handleInternalRoutes } from './routes/internal';
import { handleAgentRoutes } from './routes/agent';
import {
  verifyAuthToken,
  getMaintenanceMode,
  deleteOldUsageLogs,
  getUsersScheduledForDeletion,
  hardDeleteUser,
} from '@node2flow/platform-core';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === '/' && request.method === 'GET') {
      return Response.json({
        service: 'node2flow-platform',
        status: 'ok',
        version: '1.0.0',
      });
    }

    // Maintenance mode check (skip for internal, admin, and health)
    if (!path.startsWith('/internal/') && !path.startsWith('/api/admin/') && path !== '/') {
      const maintenance = await getMaintenanceMode(env.RATE_LIMIT_KV);
      if (maintenance.enabled) {
        return apiResponse({
          success: false,
          error: { code: 'MAINTENANCE', message: maintenance.message || 'Service is under maintenance' },
        }, 503);
      }
    }

    try {
      // Internal API (service binding only - not internet-facing)
      if (path.startsWith('/internal/')) {
        const result = await handleInternalRoutes(request, env, path);
        if (result) return result;
      }

      // Agent routes (HMAC auth - separate from JWT)
      if (path.startsWith('/api/agent/')) {
        const result = await handleAgentRoutes(request, env, path);
        if (result) return result;
      }

      // Auth routes (mostly public)
      if (path.startsWith('/api/auth/') || path === '/api/plans' || path === '/api/platform-stats') {
        const result = await handleAuthRoutes(request, env, path, ctx);
        if (result) return result;
      }

      // Billing routes (webhook is public, rest needs auth)
      if (path.startsWith('/api/billing/') || path === '/api/webhooks/stripe') {
        let authUser: { userId: string; email: string; plan: string } | null = null;
        if (path !== '/api/webhooks/stripe') {
          authUser = await verifyAuthToken(request, env.JWT_SECRET);
          if (!authUser) {
            return apiResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
          }
        }
        const result = await handleBillingRoutes(request, env, path, authUser);
        if (result) return result;
      }

      // Admin routes (admin auth verified inside handler)
      if (path.startsWith('/api/admin/')) {
        const result = await handleAdminRoutes(request, env, path);
        if (result) return result;
      }

      // User routes (all require auth)
      if (path.startsWith('/api/')) {
        const authUser = await verifyAuthToken(request, env.JWT_SECRET);
        if (!authUser) {
          return apiResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
        }
        const result = await handleUserRoutes(request, env, path, authUser, ctx);
        if (result) return result;
      }

      // Not found
      return apiResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } }, 404);
    } catch (error: any) {
      console.error(`[Platform] Error: ${error.message}`, error.stack);
      return apiResponse({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An internal error occurred' },
      }, 500);
    }
  },

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[CRON] Running scheduled tasks at ${new Date().toISOString()}`);

    // Task 1: Delete old usage logs (90 days retention)
    try {
      const deletedLogs = await deleteOldUsageLogs(env.DB, 90);
      console.log(`[CRON] Deleted ${deletedLogs} usage logs older than 90 days`);
    } catch (error: any) {
      console.error(`[CRON] Failed to delete old usage logs: ${error.message}`);
    }

    // Task 2: Process scheduled account deletions (30-day grace period expired)
    try {
      const usersToDelete = await getUsersScheduledForDeletion(env.DB);
      console.log(`[CRON] Found ${usersToDelete.length} accounts ready for permanent deletion`);

      for (const user of usersToDelete) {
        try {
          await hardDeleteUser(env.DB, user.id);
          console.log(`[CRON] Permanently deleted user ${user.email} (ID: ${user.id})`);
        } catch (err: any) {
          console.error(`[CRON] Failed to delete user ${user.id}: ${err.message}`);
        }
      }
    } catch (error: any) {
      console.error(`[CRON] Failed to process scheduled deletions: ${error.message}`);
    }

    // Note: Inactive connection cleanup is handled by MCP Gateway Worker
    // (connections live in Gateway DB, not Platform DB)

    console.log(`[CRON] Scheduled tasks completed at ${new Date().toISOString()}`);
  },
} satisfies ExportedHandler<Env>;
