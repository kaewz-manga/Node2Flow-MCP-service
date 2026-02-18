-- Track MCP client name (from User-Agent header) in usage logs
ALTER TABLE usage_logs ADD COLUMN client_name TEXT DEFAULT NULL;
