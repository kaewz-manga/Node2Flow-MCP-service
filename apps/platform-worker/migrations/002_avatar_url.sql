-- Add avatar_url column for OAuth profile pictures
ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT NULL;
