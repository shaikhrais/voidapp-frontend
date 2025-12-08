-- Migration: 0001_initial_schema.sql
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'super_admin', 'agency_admin', 'business_admin')),
    organization_id TEXT,
    reset_password_token TEXT,
    reset_password_expires INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Create Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    credits REAL DEFAULT 0.0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Create Phone Numbers table
CREATE TABLE IF NOT EXISTS phone_numbers (
    id TEXT PRIMARY KEY,
    sid TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    friendly_name TEXT,
    organization_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Create Calls table
CREATE TABLE IF NOT EXISTS calls (
    id TEXT PRIMARY KEY,
    sid TEXT UNIQUE NOT NULL,
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    status TEXT,
    direction TEXT,
    duration INTEGER,
    organization_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Create Messages table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sid TEXT UNIQUE NOT NULL,
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    body TEXT,
    status TEXT,
    direction TEXT,
    organization_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Create API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    last_used_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Create Invitations table
CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'expired')),
    organization_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_org ON phone_numbers(organization_id);
CREATE INDEX IF NOT EXISTS idx_calls_org ON calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_org ON messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);
