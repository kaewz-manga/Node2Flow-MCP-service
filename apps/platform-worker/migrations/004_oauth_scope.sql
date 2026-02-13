-- Add OAuth scope column for MCP access control
ALTER TABLE users ADD COLUMN oauth_scope TEXT;
