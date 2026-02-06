-- ============================================
-- Data Migration: Single DB → Split Architecture
-- ============================================
-- FROM: n8n-management-mcp single D1 database
-- TO:   Platform DB (platform-db) + Gateway DB (products-db)
--
-- Run order:
--   1. Create new D1 databases (platform-db, products-db)
--   2. Run schema migrations on each
--   3. Export data from old DB
--   4. Run this script to transform and import
--
-- IMPORTANT: Backup old database before running!
-- wrangler d1 export n8n-management-mcp-db --remote --output=backup.sql

-- ============================================
-- PART 1: Platform DB (platform-db)
-- ============================================
-- Tables: users, plans, api_keys, usage_logs, usage_monthly,
--         platform_stats, admin_logs, ai_connections, bot_connections, feedback
--
-- These tables copy directly from the old DB with no schema changes.
-- Run the 001_platform_schema.sql migration first, then:

-- 1a. Copy users (as-is)
INSERT INTO users (id, email, password_hash, plan, status, stripe_customer_id,
    is_admin, session_duration_seconds, oauth_provider, oauth_id,
    totp_secret_encrypted, totp_enabled, scheduled_deletion_at, created_at, updated_at)
SELECT id, email, password_hash, plan, status, stripe_customer_id,
    is_admin, session_duration_seconds, oauth_provider, oauth_id,
    totp_secret_encrypted, totp_enabled, scheduled_deletion_at, created_at, updated_at
FROM old_db.users;

-- 1b. Copy plans (skip if seed data is identical)
-- Plans are seeded by migration, only copy if customized
-- INSERT INTO plans SELECT * FROM old_db.plans;

-- 1c. Copy api_keys (as-is)
INSERT INTO api_keys (id, user_id, connection_id, key_hash, key_prefix, name, status, last_used_at, created_at)
SELECT id, user_id, connection_id, key_hash, key_prefix, name, status, last_used_at, created_at
FROM old_db.api_keys;

-- 1d. Copy usage_logs (as-is)
INSERT INTO usage_logs (id, user_id, api_key_id, connection_id, tool_name, status, response_time_ms, error_message, created_at)
SELECT id, user_id, api_key_id, connection_id, tool_name, status, response_time_ms, error_message, created_at
FROM old_db.usage_logs;

-- 1e. Copy usage_monthly (as-is)
INSERT INTO usage_monthly (id, user_id, year_month, request_count, success_count, error_count, created_at, updated_at)
SELECT id, user_id, year_month, request_count, success_count, error_count, created_at, updated_at
FROM old_db.usage_monthly;

-- 1f. Copy platform_stats
INSERT OR REPLACE INTO platform_stats (key, value, updated_at)
SELECT key, value, updated_at FROM old_db.platform_stats;

-- 1g. Copy admin_logs (as-is)
INSERT INTO admin_logs (id, admin_user_id, action, target_user_id, details, created_at)
SELECT id, admin_user_id, action, target_user_id, details, created_at
FROM old_db.admin_logs;

-- 1h. Copy ai_connections (as-is)
INSERT INTO ai_connections (id, user_id, name, provider_url, api_key_encrypted, model_name,
    is_default, status, created_at, updated_at)
SELECT id, user_id, name, provider_url, api_key_encrypted, model_name,
    is_default, status, created_at, updated_at
FROM old_db.ai_connections;

-- 1i. Copy bot_connections (as-is)
INSERT INTO bot_connections (id, user_id, platform, name, bot_token_encrypted,
    channel_secret_encrypted, ai_connection_id, mcp_api_key_encrypted,
    webhook_active, webhook_url, status, created_at, updated_at)
SELECT id, user_id, platform, name, bot_token_encrypted,
    channel_secret_encrypted, ai_connection_id, mcp_api_key_encrypted,
    webhook_active, webhook_url, status, created_at, updated_at
FROM old_db.bot_connections;

-- 1j. Copy feedback (as-is)
INSERT INTO feedback (id, user_id, category, message, status, admin_notes, created_at, updated_at)
SELECT id, user_id, category, message, status, admin_notes, created_at, updated_at
FROM old_db.feedback;


-- ============================================
-- PART 2: Gateway DB (products-db)
-- ============================================
-- Table: connections (unified, with product_type column)
--
-- Transform old n8n_connections → unified connections:
-- - Add product_type = 'n8n'
-- - Convert n8n_url + n8n_api_key_encrypted → config_encrypted (JSON)
--   NOTE: config_encrypted needs re-encryption in the new format!
--         Old format: AES-256-GCM encrypted string (just the API key)
--         New format: AES-256-GCM encrypted JSON ({"api_url": "...", "api_key": "..."})
--
-- This requires a script, not pure SQL. See migrate-connections.ts below.
-- The connection IDs stay the same so api_keys.connection_id still works.

-- For reference only (actual migration needs TypeScript for re-encryption):
-- INSERT INTO connections (id, user_id, product_type, name, config_encrypted, status, last_used_at, created_at, updated_at)
-- SELECT id, user_id, 'n8n', name, <re-encrypted-config>, status, last_used_at, created_at, updated_at
-- FROM old_db.n8n_connections;


-- ============================================
-- PART 3: Verification Queries
-- ============================================
-- Run these after migration to verify row counts match

-- Platform DB
-- SELECT 'users' as tbl, COUNT(*) as cnt FROM users
-- UNION ALL SELECT 'api_keys', COUNT(*) FROM api_keys
-- UNION ALL SELECT 'usage_logs', COUNT(*) FROM usage_logs
-- UNION ALL SELECT 'usage_monthly', COUNT(*) FROM usage_monthly
-- UNION ALL SELECT 'admin_logs', COUNT(*) FROM admin_logs
-- UNION ALL SELECT 'ai_connections', COUNT(*) FROM ai_connections
-- UNION ALL SELECT 'bot_connections', COUNT(*) FROM bot_connections
-- UNION ALL SELECT 'feedback', COUNT(*) FROM feedback;

-- Gateway DB
-- SELECT 'connections' as tbl, COUNT(*) as cnt FROM connections;
-- Should equal: SELECT COUNT(*) FROM old_db.n8n_connections;
