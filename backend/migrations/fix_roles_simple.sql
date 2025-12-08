-- Simple migration: Recreate users table with all role types
-- Backup existing data first!

PRAGMA foreign_keys=OFF;

BEGIN TRANSACTION;

-- Backup existing users
CREATE TEMP TABLE users_backup AS SELECT * FROM users;

-- Drop old table
DROP TABLE users;

-- Create new table with all roles
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'super_admin', 'agency_admin', 'business_admin')),
    organization_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Restore data
INSERT INTO users SELECT * FROM users_backup;

-- Drop backup
DROP TABLE users_backup;

COMMIT;

PRAGMA foreign_keys=ON;

-- Verify
SELECT COUNT(*) as user_count FROM users;
