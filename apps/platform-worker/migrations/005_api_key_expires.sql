-- Add optional expiry date to API keys
ALTER TABLE api_keys ADD COLUMN expires_at TEXT DEFAULT NULL;
