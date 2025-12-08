-- Migration: 0002_multi_tier_tables.sql
-- Add new tables for multi-tier organization structure

-- Create enhanced organizations table (new structure)
CREATE TABLE IF NOT EXISTS organizations_v2 (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('super_admin', 'agency', 'business', 'end_user')),
    parent_organization_id TEXT,
    owner_user_id TEXT NOT NULL,
    credits REAL DEFAULT 0.0,
    billing_email TEXT,
    call_rate_per_minute REAL DEFAULT 0.02,
    sms_rate REAL DEFAULT 0.01,
    number_monthly_fee REAL DEFAULT 2.00,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#667eea',
    company_website TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'cancelled')),
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Create pricing_tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    call_rate_per_minute REAL NOT NULL,
    sms_rate REAL NOT NULL,
    number_monthly_fee REAL NOT NULL,
    included_minutes INTEGER DEFAULT 0,
    included_sms INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('credit', 'debit', 'refund')),
    amount REAL NOT NULL,
    description TEXT,
    call_id TEXT,
    message_id TEXT,
    phone_number_id TEXT,
    balance_before REAL NOT NULL,
    balance_after REAL NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
);

-- Create user_permissions table (since we can't alter users table)
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id TEXT PRIMARY KEY,
    full_name TEXT,
    can_make_calls INTEGER DEFAULT 1,
    can_send_sms INTEGER DEFAULT 1,
    can_buy_numbers INTEGER DEFAULT 0,
    can_manage_users INTEGER DEFAULT 0,
    can_view_billing INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orgs_v2_parent ON organizations_v2(parent_organization_id);
CREATE INDEX IF NOT EXISTS idx_orgs_v2_type ON organizations_v2(type);
CREATE INDEX IF NOT EXISTS idx_pricing_org ON pricing_tiers(organization_id);
CREATE INDEX IF NOT EXISTS idx_trans_org ON transactions(organization_id);

-- Seed Super Admin Organization
INSERT OR IGNORE INTO organizations_v2 VALUES (
    'org-super-admin',
    'VOIP SaaS Platform',
    'super_admin',
    NULL,
    'user-001',
    10000.00,
    'itpro.mohammed@gmail.com',
    0.01,
    0.005,
    1.00,
    NULL,
    '#667eea',
    NULL,
    'active',
    unixepoch(),
    unixepoch()
);

-- Migrate existing organization
INSERT OR IGNORE INTO organizations_v2 
SELECT 
    id,
    name,
    'business',
    'org-super-admin',
    'user-001',
    credits,
    'itpro.mohammed@gmail.com',
    0.02,
    0.01,
    2.00,
    NULL,
    '#667eea',
    NULL,
    'active',
    created_at,
    updated_at
FROM organizations WHERE id = 'org-001';

-- Set super admin permissions
INSERT OR IGNORE INTO user_permissions VALUES (
    'user-001',
    'Mohammed (Super Admin)',
    1, 1, 1, 1, 1,
    unixepoch(),
    unixepoch()
);

-- Create default pricing tier
INSERT OR IGNORE INTO pricing_tiers VALUES (
    'tier-super-admin',
    'org-super-admin',
    'Wholesale Pricing',
    0.01,
    0.005,
    1.00,
    0, 0,
    unixepoch(),
    unixepoch()
);
