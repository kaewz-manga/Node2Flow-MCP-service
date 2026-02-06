-- Unified Connections Table
-- Single table for all product types (n8n, wordpress, make, etc.)
-- Config stored as encrypted JSON - each product defines its own schema

CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_type TEXT NOT NULL,          -- 'n8n', 'wordpress', 'make', etc.
    name TEXT NOT NULL,
    config_encrypted TEXT NOT NULL,      -- AES-256-GCM encrypted JSON
    status TEXT DEFAULT 'active',        -- active, inactive, error, deleted
    last_used_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_connections_user_product
    ON connections(user_id, product_type);

CREATE INDEX IF NOT EXISTS idx_connections_user_status
    ON connections(user_id, status);
