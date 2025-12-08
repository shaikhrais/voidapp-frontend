-- Add call recording support
-- Migration: add_call_recording.sql

-- Call recordings table
CREATE TABLE IF NOT EXISTS call_recordings (
    id TEXT PRIMARY KEY,
    call_id TEXT NOT NULL,
    sid TEXT UNIQUE, -- Twilio Recording SID
    url TEXT,
    duration INTEGER,
    size INTEGER, -- bytes
    status TEXT DEFAULT 'processing', -- processing, completed, failed
    retention_days INTEGER DEFAULT 30,
    expires_at INTEGER,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (call_id) REFERENCES calls(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recordings_call ON call_recordings(call_id);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON call_recordings(status);
CREATE INDEX IF NOT EXISTS idx_recordings_expires ON call_recordings(expires_at);
CREATE INDEX IF NOT EXISTS idx_recordings_created ON call_recordings(created_at DESC);

-- Add recording settings to organizations
ALTER TABLE organizations_v2 ADD COLUMN recording_enabled BOOLEAN DEFAULT 1;
ALTER TABLE organizations_v2 ADD COLUMN recording_mode TEXT DEFAULT 'automatic'; -- automatic, on-demand, disabled
ALTER TABLE organizations_v2 ADD COLUMN recording_retention_days INTEGER DEFAULT 30;
ALTER TABLE organizations_v2 ADD COLUMN recording_announcement BOOLEAN DEFAULT 1; -- Play "This call may be recorded"

-- Add recording preference to phone numbers
ALTER TABLE phone_numbers ADD COLUMN recording_enabled BOOLEAN DEFAULT 1;
