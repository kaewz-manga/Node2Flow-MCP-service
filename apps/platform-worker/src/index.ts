// Node2Flow Platform Worker
// Central auth, billing, user management, admin panel
//
// Routes:
//   /api/auth/*       → Register, Login, OAuth, TOTP
//   /api/user/*       → Profile, password, session, delete
//   /api/billing/*    → Stripe checkout, portal, webhook
//   /api/admin/*      → Admin panel APIs
//   /api/plans        → Public plan listing
//   /api/usage        → User usage stats
//   /internal/*       → Product Worker internal API (service binding only)

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/' && request.method === 'GET') {
      return Response.json({
        service: 'node2flow-platform',
        status: 'ok',
        version: '0.1.0',
      });
    }

    // TODO: Phase 4 - Implement platform routes
    // - /api/auth/* (from n8n-management-mcp auth routes)
    // - /api/user/* (from n8n-management-mcp user routes)
    // - /api/billing/* (from n8n-management-mcp billing routes)
    // - /api/admin/* (from n8n-management-mcp admin routes)
    // - /internal/* (new - for MCP Gateway service binding)

    return Response.json({ error: 'Not found' }, { status: 404 });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // TODO: Phase 4 - Implement cron jobs
    // - Delete old usage logs (90+ days)
    // - Hard-delete scheduled accounts (30-day grace expired)
    console.log('Cron job executed at:', new Date().toISOString());
  },
} satisfies ExportedHandler<Env>;

interface Env {
  DB: D1Database;
  RATE_LIMIT_KV: KVNamespace;
  OAUTH_STATE_KV: KVNamespace;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_PRO: string;
  STRIPE_PRICE_ENTERPRISE: string;
  // OAuth
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}
