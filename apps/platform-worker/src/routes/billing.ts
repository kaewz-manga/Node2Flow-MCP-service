/**
 * Billing Routes: Stripe checkout, portal, webhook
 */

import type { Env } from '../types';
import { apiResponse } from '../helpers';
import {
  createCheckoutSession,
  createBillingPortalSession,
  handleStripeWebhook,
} from '@node2flow/platform-core';

export async function handleBillingRoutes(
  request: Request,
  env: Env,
  path: string,
  authUser: { userId: string; email: string; plan: string } | null
): Promise<Response | null> {
  const method = request.method;

  // POST /api/webhooks/stripe (no auth - signature verified internally)
  if (path === '/api/webhooks/stripe' && method === 'POST') {
    return handleStripeWebhook(request, env as any);
  }

  // Remaining billing routes require auth
  if (!authUser) return null;

  // POST /api/billing/checkout
  if (path === '/api/billing/checkout' && method === 'POST') {
    try {
      const body = await request.json() as { plan_id: string };
      if (!body.plan_id) {
        return apiResponse({ success: false, error: { code: 'INVALID_REQUEST', message: 'plan_id is required' } }, 400);
      }
      const result = await createCheckoutSession(env as any, authUser.userId, body.plan_id);
      return apiResponse({ success: true, data: result });
    } catch (error: any) {
      return apiResponse({ success: false, error: { code: 'BILLING_ERROR', message: error.message } }, 400);
    }
  }

  // POST /api/billing/portal
  if (path === '/api/billing/portal' && method === 'POST') {
    try {
      const result = await createBillingPortalSession(env as any, authUser.userId);
      return apiResponse({ success: true, data: result });
    } catch (error: any) {
      return apiResponse({ success: false, error: { code: 'BILLING_ERROR', message: error.message } }, 400);
    }
  }

  return null;
}
