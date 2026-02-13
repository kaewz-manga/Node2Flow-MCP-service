-- Migration 003: Add scope column to api_keys for scoped API keys
-- Allows API keys to access all services (connection_id = '_all') with optional scope filtering
-- Scope JSON format: { "plugins": ["n8n", "wordpress"], "permissions": ["read", "write", "delete"] }

ALTER TABLE api_keys ADD COLUMN scope TEXT;
