-- Migration: Add user_id to calls table for user attribution
-- This allows tracking which user made each call

ALTER TABLE calls ADD COLUMN user_id TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_calls_organization_id ON calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
