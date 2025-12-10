-- Drop all existing tables
DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS calls;
DROP TABLE IF EXISTS phone_numbers;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS pricing_tiers;
DROP TABLE IF EXISTS user_permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations_v2;

-- Recreate complete schema
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'super_admin', 'agency_admin', 'business_admin')),
    organization_id TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

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

CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('credit', 'debit')),
    description TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (organization_id) REFERENCES organizations_v2(id)
);

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

-- Insert Super Admin Organization
INSERT INTO organizations_v2 (id, name, type, parent_organization_id, owner_user_id, credits, billing_email, status, created_at, updated_at)
VALUES ('org-super-admin', 'Super Admin', 'super_admin', NULL, 'user-super-admin', 100000.0, 'itpro.mohammed@gmail.com', 'active', unixepoch(), unixepoch());

-- Insert Super Admin User (password: Rsoft@999)
INSERT INTO users (id, email, password, role, organization_id, created_at, updated_at)
VALUES ('user-super-admin', 'itpro.mohammed@gmail.com', '0705c29f67eb09d03fbcd2e25a2c0d154d25e161a2649dba68d1123c1c9cb8f5', 'super_admin', 'org-super-admin', unixepoch(), unixepoch());

-- Insert Super Admin Permissions
INSERT INTO user_permissions (user_id, full_name, can_make_calls, can_send_sms, can_buy_numbers, can_manage_users, can_view_billing, created_at, updated_at)
VALUES ('user-super-admin', 'Mohammed (Super Admin)', 1, 1, 1, 1, 1, unixepoch(), unixepoch());

-- Agency: TechCom Solutions
INSERT INTO organizations_v2 (id, name, type, parent_organization_id, owner_user_id, credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee, status, created_at, updated_at)
VALUES ('org-agency-001', 'TechCom Solutions', 'agency', 'org-super-admin', 'user-agency-admin-001', 50000.00, 'billing@techcom.com', 0.015, 0.012, 1.50, 'active', unixepoch(), unixepoch());

INSERT INTO users (id, email, password, role, organization_id, created_at, updated_at)
VALUES ('user-agency-admin-001', 'john@techcom.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'agency_admin', 'org-agency-001', unixepoch(), unixepoch());

INSERT INTO user_permissions (user_id, full_name, can_make_calls, can_send_sms, can_buy_numbers, can_manage_users, can_view_billing)
VALUES ('user-agency-admin-001', 'John Smith', 1, 1, 1, 1, 1);

-- Business: Acme Corporation
INSERT INTO organizations_v2 (id, name, type, parent_organization_id, owner_user_id, credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee, status, created_at, updated_at)
VALUES ('org-business-001', 'Acme Corporation', 'business', 'org-agency-001', 'user-business-admin-001', 10000.00, 'billing@acmecorp.com', 0.02, 0.015, 2.00, 'active', unixepoch(), unixepoch());

INSERT INTO users (id, email, password, role, organization_id, created_at, updated_at)
VALUES ('user-business-admin-001', 'sarah@acmecorp.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'business_admin', 'org-business-001', unixepoch(), unixepoch());

INSERT INTO user_permissions (user_id, full_name, can_make_calls, can_send_sms, can_buy_numbers, can_manage_users, can_view_billing)
VALUES ('user-business-admin-001', 'Sarah Johnson', 1, 1, 1, 1, 1);

-- Business Users
INSERT INTO users (id, email, password, role, organization_id, created_at, updated_at)
VALUES 
    ('user-business-001-1', 'mike@acmecorp.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'user', 'org-business-001', unixepoch(), unixepoch()),
    ('user-business-001-2', 'lisa@acmecorp.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'user', 'org-business-001', unixepoch(), unixepoch());

INSERT INTO user_permissions (user_id, full_name, can_make_calls, can_send_sms, can_buy_numbers, can_manage_users, can_view_billing)
VALUES 
    ('user-business-001-1', 'Mike Chen', 1, 1, 0, 0, 0),
    ('user-business-001-2', 'Lisa Anderson', 1, 1, 0, 0, 0);

-- Phone Numbers
INSERT INTO phone_numbers (id, sid, phone_number, friendly_name, organization_id, created_at, updated_at)
VALUES 
    ('num-business-001-1', 'PN001', '+14155552001', 'Acme Sales', 'org-business-001', unixepoch(), unixepoch()),
    ('num-business-001-2', 'PN002', '+14155552002', 'Acme Support', 'org-business-001', unixepoch(), unixepoch()),
    ('num-agency-001-1', 'PN003', '+14155551001', 'TechCom Main', 'org-agency-001', unixepoch(), unixepoch());

-- Sample Calls
INSERT INTO calls (id, sid, from_number, to_number, status, direction, duration, organization_id, created_at, updated_at)
VALUES 
    ('call-001', 'CA001', '+14155552001', '+14085551234', 'completed', 'outbound', 180, 'org-business-001', unixepoch(), unixepoch()),
    ('call-002', 'CA002', '+14155552001', '+14085555678', 'completed', 'outbound', 240, 'org-business-001', unixepoch(), unixepoch()),
    ('call-003', 'CA003', '+14155552002', '+14085559999', 'completed', 'outbound', 120, 'org-business-001', unixepoch(), unixepoch());

-- Sample Messages
INSERT INTO messages (id, sid, from_number, to_number, body, status, direction, organization_id, created_at, updated_at)
VALUES 
    ('msg-001', 'SM001', '+14155552001', '+14085551234', 'Hi! Thanks for your interest in our product.', 'delivered', 'outbound', 'org-business-001', unixepoch(), unixepoch()),
    ('msg-002', 'SM002', '+14085551234', '+14155552001', 'Tomorrow at 2pm works for me', 'received', 'inbound', 'org-business-001', unixepoch(), unixepoch());

-- Transactions
INSERT INTO transactions (id, organization_id, amount, type, description, created_at)
VALUES 
    ('txn-001', 'org-super-admin', 100000.00, 'credit', 'Initial platform credits', unixepoch()),
    ('txn-002', 'org-agency-001', 50000.00, 'credit', 'Initial agency credits', unixepoch()),
    ('txn-003', 'org-business-001', 10000.00, 'credit', 'Initial business credits', unixepoch());

-- Pricing Tiers
INSERT INTO pricing_tiers (id, organization_id, name, call_rate_per_minute, sms_rate, number_monthly_fee, created_at)
VALUES 
    ('tier-super', 'org-super-admin', 'Platform', 0.01, 0.01, 1.00, unixepoch()),
    ('tier-agency-001', 'org-agency-001', 'Agency Standard', 0.015, 0.012, 1.50, unixepoch()),
    ('tier-business-001', 'org-business-001', 'Business Pro', 0.02, 0.015, 2.00, unixepoch());

SELECT 'Production database created successfully!' as message;
SELECT 'Super Admin: itpro.mohammed@gmail.com / Rsoft@999' as credentials;
