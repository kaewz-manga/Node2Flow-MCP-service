/**
 * Platform Worker Environment Bindings
 */
export interface Env {
  DB: D1Database;
  RATE_LIMIT_KV: KVNamespace;
  OAUTH_STATE_KV: KVNamespace;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_STARTER: string;
  STRIPE_PRICE_PRO: string;
  STRIPE_PRICE_ENTERPRISE: string;
  // OAuth
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  // App
  APP_URL: string;
  ENVIRONMENT: string;
  // Agent
  AGENT_SECRET: string;
  AGENT_URL: string;
  // Email
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
}
