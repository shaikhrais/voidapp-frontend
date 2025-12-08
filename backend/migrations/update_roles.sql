-- Migration: Update users table to support all role types
-- This adds super_admin, agency_admin, and business_admin to the allowed roles

-- Drop the old CHECK constraint and recreate the table with new roles
-- SQLite doesn't support ALTER TABLE to modify CHECK constraints, so we need to recreate

-- Create new table with updated constraint
CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'super_admin', 'agency_admin', 'business_admin')),
    organization_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations_v2(id)
);

-- Copy data from old table
INSERT INTO users_new SELECT * FROM users;

-- Drop old table
DROP TABLE users;

-- Rename new table
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes if any existed
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
