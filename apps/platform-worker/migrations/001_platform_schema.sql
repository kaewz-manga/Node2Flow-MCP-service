-- Platform Worker Schema (consolidated from n8n-management-mcp migrations)
-- All platform tables: users, plans, api_keys, usage, admin, feedback, etc.

-- ============================================
-- Users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    stripe_customer_id TEXT,
    is_admin INTEGER DEFAULT 0,
    session_duration_seconds INTEGER DEFAULT 86400,
    oauth_provider TEXT,
    oauth_id TEXT,
    totp_secret_encrypted TEXT,
    totp_enabled INTEGER DEFAULT 0,
    scheduled_deletion_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_scheduled_deletion ON users(scheduled_deletion_at);

-- ============================================
-- Plans
-- ============================================
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    daily_request_limit INTEGER DEFAULT -1,
    requests_per_minute INTEGER DEFAULT 10,
    monthly_request_limit INTEGER DEFAULT -1,
    max_connections INTEGER DEFAULT 1,
    price_monthly REAL DEFAULT 0,
    features TEXT DEFAULT '{}',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO plans (id, name, daily_request_limit, requests_per_minute, monthly_request_limit, max_connections, price_monthly, features, is_active) VALUES
    ('free', 'Free', 100, 50, -1, -1, 0, '{"support": "community", "analytics": false}', 1),
    ('pro', 'Pro', 5000, 100, -1, -1, 19, '{"support": "priority", "analytics": true, "fair_use": true}', 1),
    ('enterprise', 'Enterprise', -1, -1, -1, -1, -1, '{"support": "dedicated", "analytics": true, "private_server": true, "contact_us": true}', 1);

-- ============================================
-- n8n Connections (legacy - still used by Platform for connection management)
-- ============================================
CREATE TABLE IF NOT EXISTS n8n_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    n8n_url TEXT NOT NULL,
    n8n_api_key_encrypted TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    last_used_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_connections_user ON n8n_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_last_used ON n8n_connections(last_used_at);

-- ============================================
-- API Keys
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    connection_id TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    key_prefix TEXT NOT NULL,
    name TEXT DEFAULT 'Default',
    status TEXT DEFAULT 'active',
    last_used_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (connection_id) REFERENCES n8n_connections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);

-- ============================================
-- Usage Tracking
-- ============================================
CREATE TABLE IF NOT EXISTS usage_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    api_key_id TEXT NOT NULL,
    connection_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    status TEXT NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tool ON usage_logs(tool_name);
CREATE INDEX IF NOT EXISTS idx_usage_logs_status ON usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_created ON usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);

CREATE TABLE IF NOT EXISTS usage_monthly (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    year_month TEXT NOT NULL,
    request_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, year_month),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_usage_monthly_user ON usage_monthly(user_id);

-- ============================================
-- Platform Stats
-- ============================================
CREATE TABLE IF NOT EXISTS platform_stats (
    key TEXT PRIMARY KEY,
    value INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO platform_stats (key, value) VALUES
    ('total_users', 0),
    ('total_executions', 0),
    ('total_successes', 0);

-- ============================================
-- Admin Logs
-- ============================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_user_id TEXT,
    details TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (admin_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);

-- ============================================
-- AI Connections (BYOK)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Default AI',
    provider_url TEXT NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    model_name TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_connections_user ON ai_connections(user_id);

-- ============================================
-- Bot Connections
-- ============================================
CREATE TABLE IF NOT EXISTS bot_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'My Bot',
    bot_token_encrypted TEXT NOT NULL,
    channel_secret_encrypted TEXT,
    ai_connection_id TEXT NOT NULL,
    mcp_api_key_encrypted TEXT NOT NULL,
    webhook_active INTEGER DEFAULT 0,
    webhook_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ai_connection_id) REFERENCES ai_connections(id)
);

CREATE INDEX IF NOT EXISTS idx_bot_connections_user ON bot_connections(user_id);

-- ============================================
-- Feedback
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    admin_notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
