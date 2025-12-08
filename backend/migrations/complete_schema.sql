-- Complete Schema with Proper Roles
-- Users table with all role types
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'super_admin', 'agency_admin', 'business_admin')),
    organization_id TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Organizations v2 table
CREATE TABLE organizations_v2 (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('super_admin', 'agency', 'business')),
    parent_organization_id TEXT,
    owner_user_id TEXT,
    credits REAL DEFAULT 0.0,
    billing_email TEXT,
    call_rate_per_minute REAL DEFAULT 0.02,
    sms_rate REAL DEFAULT 0.01,
    number_monthly_fee REAL DEFAULT 2.00,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'cancelled')),
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- User permissions
CREATE TABLE user_permissions (
    user_id TEXT PRIMARY KEY,
    full_name TEXT,
    can_make_calls INTEGER DEFAULT 1,
    can_send_sms INTEGER DEFAULT 1,
    can_buy_numbers INTEGER DEFAULT 0,
    can_manage_users INTEGER DEFAULT 0,
    can_view_billing INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Pricing tiers
CREATE TABLE pricing_tiers (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT,
    call_rate_per_minute REAL,
    sms_rate REAL,
    number_monthly_fee REAL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (organization_id) REFERENCES organizations_v2(id)
);

-- Transactions
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('credit', 'debit')),
    description TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (organization_id) REFERENCES organizations_v2(id)
);

-- Phone numbers
CREATE TABLE phone_numbers (
    id TEXT PRIMARY KEY,
    sid TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    friendly_name TEXT,
    organization_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (organization_id) REFERENCES organizations_v2(id)
);

-- Calls
CREATE TABLE calls (
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
    FOREIGN KEY (organization_id) REFERENCES organizations_v2(id)
);

-- Messages
CREATE TABLE messages (
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
    FOREIGN KEY (organization_id) REFERENCES organizations_v2(id)
);

-- Invitations
CREATE TABLE invitations (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    invited_by_user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'expired')),
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (organization_id) REFERENCES organizations_v2(id),
    FOREIGN KEY (invited_by_user_id) REFERENCES users(id)
);

-- Insert Super Admin organization
INSERT INTO organizations_v2 (id, name, type, parent_organization_id, owner_user_id, credits, status, created_at, updated_at)
VALUES ('org-super-admin', 'Super Admin', 'super_admin', NULL, 'user-001', 10000.0, 'active', unixepoch(), unixepoch());

-- Insert Super Admin user (password: Rsoft@999)
INSERT INTO users (id, email, password, role, organization_id, created_at, updated_at)
VALUES ('user-001', 'itpro.mohammed@gmail.com', 'e0ff9a0f7e8f4c3e8b8c5f5e3d3c2b1a0f9e8d7c6b5a4938271605f4e3d2c1b0', 'super_admin', 'org-super-admin', unixepoch(), unixepoch());

-- Insert Super Admin permissions
INSERT INTO user_permissions (user_id, full_name, can_make_calls, can_send_sms, can_buy_numbers, can_manage_users, can_view_billing, created_at, updated_at)
VALUES ('user-001', 'Mohammed (Super Admin)', 1, 1, 1, 1, 1, unixepoch(), unixepoch());
