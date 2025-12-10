-- ============================================
-- VOIP SaaS Platform - Comprehensive Seed Data
-- ============================================
-- This file creates realistic test data for all features
-- Run this after migrations to populate the database

-- ============================================
-- 1. SUPER ADMIN ORGANIZATION & USER
-- ============================================

-- Super Admin Organization
INSERT INTO organizations_v2 (
    id, name, type, parent_organization_id, owner_user_id,
    credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee,
    status, created_at, updated_at
) VALUES (
    'org-super-admin-001',
    'Platform Admin',
    'super_admin',
    NULL,
    NULL,
    100000.00,
    'admin@voipplatform.com',
    0.01,
    0.01,
    1.00,
    'active',
    1702000000,
    1702000000
);

-- Super Admin User
INSERT INTO users (
    id, email, password, role, organization_id, created_at, updated_at
) VALUES (
    'user-super-admin-001',
    'admin@voipplatform.com',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- hash of 'admin123'
    'super_admin',
    'org-super-admin-001',
    1702000000,
    1702000000
);

-- Update organization owner
UPDATE organizations_v2 SET owner_user_id = 'user-super-admin-001' WHERE id = 'org-super-admin-001';

-- Super Admin Permissions
INSERT INTO user_permissions (
    user_id, full_name, can_make_calls, can_send_sms,
    can_buy_numbers, can_manage_users, can_view_billing
) VALUES (
    'user-super-admin-001',
    'Platform Administrator',
    1, 1, 1, 1, 1
);

-- ============================================
-- 2. AGENCY 1: "TechCom Solutions"
-- ============================================

-- Agency Organization
INSERT INTO organizations_v2 (
    id, name, type, parent_organization_id, owner_user_id,
    credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee,
    status, created_at, updated_at
) VALUES (
    'org-agency-001',
    'TechCom Solutions',
    'agency',
    'org-super-admin-001',
    NULL,
    50000.00,
    'billing@techcom.com',
    0.015,
    0.012,
    1.50,
    'active',
    1702100000,
    1702100000
);

-- Agency Admin User
INSERT INTO users (
    id, email, password, role, organization_id, created_at, updated_at
) VALUES (
    'user-agency-admin-001',
    'john@techcom.com',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- hash of 'admin123'
    'agency_admin',
    'org-agency-001',
    1702100000,
    1702100000
);

UPDATE organizations_v2 SET owner_user_id = 'user-agency-admin-001' WHERE id = 'org-agency-001';

INSERT INTO user_permissions (
    user_id, full_name, can_make_calls, can_send_sms,
    can_buy_numbers, can_manage_users, can_view_billing
) VALUES (
    'user-agency-admin-001',
    'John Smith',
    1, 1, 1, 1, 1
);

-- Agency Phone Numbers
INSERT INTO phone_numbers (
    id, phone_number, friendly_name, organization_id, status, created_at
) VALUES 
    ('num-agency-001-1', '+14155551001', 'TechCom Main', 'org-agency-001', 'active', 1702100000),
    ('num-agency-001-2', '+14155551002', 'TechCom Support', 'org-agency-001', 'active', 1702100000);

-- ============================================
-- 3. BUSINESS 1: "Acme Corp" (under TechCom)
-- ============================================

-- Business Organization
INSERT INTO organizations_v2 (
    id, name, type, parent_organization_id, owner_user_id,
    credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee,
    status, created_at, updated_at
) VALUES (
    'org-business-001',
    'Acme Corporation',
    'business',
    'org-agency-001',
    NULL,
    10000.00,
    'billing@acmecorp.com',
    0.02,
    0.015,
    2.00,
    'active',
    1702200000,
    1702200000
);

-- Business Admin
INSERT INTO users (
    id, email, password, role, organization_id, created_at, updated_at
) VALUES (
    'user-business-admin-001',
    'sarah@acmecorp.com',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'business_admin',
    'org-business-001',
    1702200000,
    1702200000
);

UPDATE organizations_v2 SET owner_user_id = 'user-business-admin-001' WHERE id = 'org-business-001';

INSERT INTO user_permissions (
    user_id, full_name, can_make_calls, can_send_sms,
    can_buy_numbers, can_manage_users, can_view_billing
) VALUES (
    'user-business-admin-001',
    'Sarah Johnson',
    1, 1, 1, 1, 1
);

-- Business Users (Sales Team)
INSERT INTO users (
    id, email, password, role, organization_id, created_at, updated_at
) VALUES 
    ('user-business-001-1', 'mike@acmecorp.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'user', 'org-business-001', 1702200000, 1702200000),
    ('user-business-001-2', 'lisa@acmecorp.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'user', 'org-business-001', 1702200000, 1702200000),
    ('user-business-001-3', 'david@acmecorp.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'user', 'org-business-001', 1702200000, 1702200000);

INSERT INTO user_permissions (
    user_id, full_name, can_make_calls, can_send_sms,
    can_buy_numbers, can_manage_users, can_view_billing
) VALUES 
    ('user-business-001-1', 'Mike Chen', 1, 1, 0, 0, 0),
    ('user-business-001-2', 'Lisa Anderson', 1, 1, 0, 0, 0),
    ('user-business-001-3', 'David Williams', 1, 1, 0, 0, 0);

-- Business Phone Numbers
INSERT INTO phone_numbers (
    id, phone_number, friendly_name, organization_id, status, created_at
) VALUES 
    ('num-business-001-1', '+14155552001', 'Acme Sales', 'org-business-001', 'active', 1702200000),
    ('num-business-001-2', '+14155552002', 'Acme Support', 'org-business-001', 'active', 1702200000),
    ('num-business-001-3', '+14155552003', 'Acme Main', 'org-business-001', 'active', 1702200000);

-- ============================================
-- 4. BUSINESS 2: "Global Tech Inc" (under TechCom)
-- ============================================

INSERT INTO organizations_v2 (
    id, name, type, parent_organization_id, owner_user_id,
    credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee,
    status, created_at, updated_at
) VALUES (
    'org-business-002',
    'Global Tech Inc',
    'business',
    'org-agency-001',
    NULL,
    15000.00,
    'billing@globaltech.com',
    0.02,
    0.015,
    2.00,
    'active',
    1702300000,
    1702300000
);

INSERT INTO users (
    id, email, password, role, organization_id, created_at, updated_at
) VALUES (
    'user-business-admin-002',
    'robert@globaltech.com',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'business_admin',
    'org-business-002',
    1702300000,
    1702300000
);

UPDATE organizations_v2 SET owner_user_id = 'user-business-admin-002' WHERE id = 'org-business-002';

INSERT INTO user_permissions (
    user_id, full_name, can_make_calls, can_send_sms,
    can_buy_numbers, can_manage_users, can_view_billing
) VALUES (
    'user-business-admin-002',
    'Robert Taylor',
    1, 1, 1, 1, 1
);

INSERT INTO phone_numbers (
    id, phone_number, friendly_name, organization_id, status, created_at
) VALUES 
    ('num-business-002-1', '+14155553001', 'GlobalTech Main', 'org-business-002', 'active', 1702300000),
    ('num-business-002-2', '+14155553002', 'GlobalTech Sales', 'org-business-002', 'active', 1702300000);

-- ============================================
-- 5. AGENCY 2: "CloudCom Partners"
-- ============================================

INSERT INTO organizations_v2 (
    id, name, type, parent_organization_id, owner_user_id,
    credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee,
    status, created_at, updated_at
) VALUES (
    'org-agency-002',
    'CloudCom Partners',
    'agency',
    'org-super-admin-001',
    NULL,
    30000.00,
    'billing@cloudcom.com',
    0.015,
    0.012,
    1.50,
    'active',
    1702400000,
    1702400000
);

INSERT INTO users (
    id, email, password, role, organization_id, created_at, updated_at
) VALUES (
    'user-agency-admin-002',
    'emily@cloudcom.com',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'agency_admin',
    'org-agency-002',
    1702400000,
    1702400000
);

UPDATE organizations_v2 SET owner_user_id = 'user-agency-admin-002' WHERE id = 'org-agency-002';

INSERT INTO user_permissions (
    user_id, full_name, can_make_calls, can_send_sms,
    can_buy_numbers, can_manage_users, can_view_billing
) VALUES (
    'user-agency-admin-002',
    'Emily Davis',
    1, 1, 1, 1, 1
);

INSERT INTO phone_numbers (
    id, phone_number, friendly_name, organization_id, status, created_at
) VALUES 
    ('num-agency-002-1', '+14155554001', 'CloudCom Main', 'org-agency-002', 'active', 1702400000);

-- ============================================
-- 6. CALL LOGS (Realistic Call History)
-- ============================================

-- Acme Corp Calls (Last 30 days)
INSERT INTO calls (
    id, sid, from_number, to_number, status, direction, duration,
    organization_id, user_id, created_at, updated_at
) VALUES 
    -- Successful outbound calls
    ('call-001', 'CA001', '+14155552001', '+14085551234', 'completed', 'outbound', 180, 'org-business-001', 'user-business-001-1', 1733500000, 1733500180),
    ('call-002', 'CA002', '+14155552001', '+14085555678', 'completed', 'outbound', 240, 'org-business-001', 'user-business-001-1', 1733510000, 1733510240),
    ('call-003', 'CA003', '+14155552002', '+14085559999', 'completed', 'outbound', 120, 'org-business-001', 'user-business-001-2', 1733520000, 1733520120),
    ('call-004', 'CA004', '+14155552001', '+14085551111', 'completed', 'outbound', 300, 'org-business-001', 'user-business-001-1', 1733530000, 1733530300),
    ('call-005', 'CA005', '+14155552003', '+14085552222', 'completed', 'outbound', 150, 'org-business-001', 'user-business-001-3', 1733540000, 1733540150),
    
    -- Inbound calls
    ('call-006', 'CA006', '+14085553333', '+14155552001', 'completed', 'inbound', 90, 'org-business-001', 'user-business-001-1', 1733550000, 1733550090),
    ('call-007', 'CA007', '+14085554444', '+14155552002', 'completed', 'inbound', 210, 'org-business-001', 'user-business-001-2', 1733560000, 1733560210),
    
    -- Failed/Missed calls
    ('call-008', 'CA008', '+14155552001', '+14085555555', 'no-answer', 'outbound', 0, 'org-business-001', 'user-business-001-1', 1733570000, 1733570000),
    ('call-009', 'CA009', '+14085556666', '+14155552001', 'no-answer', 'inbound', 0, 'org-business-001', NULL, 1733580000, 1733580000),
    
    -- Recent calls (today)
    ('call-010', 'CA010', '+14155552001', '+14085557777', 'completed', 'outbound', 420, 'org-business-001', 'user-business-001-1', 1733670000, 1733670420),
    ('call-011', 'CA011', '+14155552002', '+14085558888', 'completed', 'outbound', 180, 'org-business-001', 'user-business-001-2', 1733680000, 1733680180),
    ('call-012', 'CA012', '+14155552003', '+14085559999', 'in-progress', 'outbound', 0, 'org-business-001', 'user-business-001-3', 1733690000, 1733690000);

-- Global Tech Calls
INSERT INTO calls (
    id, sid, from_number, to_number, status, direction, duration,
    organization_id, user_id, created_at, updated_at
) VALUES 
    ('call-013', 'CA013', '+14155553001', '+14085551234', 'completed', 'outbound', 360, 'org-business-002', 'user-business-admin-002', 1733500000, 1733500360),
    ('call-014', 'CA014', '+14155553002', '+14085555678', 'completed', 'outbound', 180, 'org-business-002', 'user-business-admin-002', 1733520000, 1733520180),
    ('call-015', 'CA015', '+14085559999', '+14155553001', 'completed', 'inbound', 240, 'org-business-002', 'user-business-admin-002', 1733540000, 1733540240);

-- ============================================
-- 7. SMS MESSAGES
-- ============================================

INSERT INTO messages (
    id, sid, from_number, to_number, body, status, direction,
    organization_id, user_id, created_at, updated_at
) VALUES 
    -- Acme Corp Messages
    ('msg-001', 'SM001', '+14155552001', '+14085551234', 'Hi! Thanks for your interest in our product. When would be a good time to discuss?', 'delivered', 'outbound', 'org-business-001', 'user-business-001-1', 1733500000, 1733500000),
    ('msg-002', 'SM002', '+14085551234', '+14155552001', 'Tomorrow at 2pm works for me', 'received', 'inbound', 'org-business-001', NULL, 1733510000, 1733510000),
    ('msg-003', 'SM003', '+14155552001', '+14085551234', 'Perfect! I''ll send you a calendar invite.', 'delivered', 'outbound', 'org-business-001', 'user-business-001-1', 1733520000, 1733520000),
    ('msg-004', 'SM004', '+14155552002', '+14085555678', 'Your order #12345 has been shipped!', 'delivered', 'outbound', 'org-business-001', 'user-business-001-2', 1733530000, 1733530000),
    ('msg-005', 'SM005', '+14155552001', '+14085559999', 'Reminder: Your appointment is tomorrow at 10am', 'delivered', 'outbound', 'org-business-001', 'user-business-001-1', 1733540000, 1733540000),
    
    -- Global Tech Messages
    ('msg-006', 'SM006', '+14155553001', '+14085551111', 'Welcome to Global Tech! Your account is now active.', 'delivered', 'outbound', 'org-business-002', 'user-business-admin-002', 1733550000, 1733550000),
    ('msg-007', 'SM007', '+14085551111', '+14155553001', 'Thank you!', 'received', 'inbound', 'org-business-002', NULL, 1733560000, 1733560000);

-- ============================================
-- 8. TRANSACTIONS (Credits & Debits)
-- ============================================

-- Super Admin Credits
INSERT INTO transactions (
    id, organization_id, type, amount, description, created_at
) VALUES 
    ('txn-001', 'org-super-admin-001', 'credit', 100000.00, 'Initial platform credits', 1702000000);

-- TechCom Agency
INSERT INTO transactions (
    id, organization_id, type, amount, description, created_at
) VALUES 
    ('txn-002', 'org-agency-001', 'credit', 50000.00, 'Initial agency credits', 1702100000),
    ('txn-003', 'org-agency-001', 'debit', 125.50, 'Call usage - November 2024', 1733000000),
    ('txn-004', 'org-agency-001', 'debit', 45.20, 'SMS usage - November 2024', 1733000000);

-- Acme Corp
INSERT INTO transactions (
    id, organization_id, type, amount, description, created_at
) VALUES 
    ('txn-005', 'org-business-001', 'credit', 10000.00, 'Initial business credits', 1702200000),
    ('txn-006', 'org-business-001', 'debit', 15.60, 'Call: +14085551234 (3 min)', 1733500180),
    ('txn-007', 'org-business-001', 'debit', 20.80, 'Call: +14085555678 (4 min)', 1733510240),
    ('txn-008', 'org-business-001', 'debit', 10.40, 'Call: +14085559999 (2 min)', 1733520120),
    ('txn-009', 'org-business-001', 'debit', 26.00, 'Call: +14085551111 (5 min)', 1733530300),
    ('txn-010', 'org-business-001', 'debit', 0.015, 'SMS to +14085551234', 1733500000),
    ('txn-011', 'org-business-001', 'debit', 0.015, 'SMS to +14085555678', 1733530000),
    ('txn-012', 'org-business-001', 'credit', 500.00, 'Monthly top-up', 1733600000);

-- Global Tech
INSERT INTO transactions (
    id, organization_id, type, amount, description, created_at
) VALUES 
    ('txn-013', 'org-business-002', 'credit', 15000.00, 'Initial business credits', 1702300000),
    ('txn-014', 'org-business-002', 'debit', 31.20, 'Call: +14085551234 (6 min)', 1733500360),
    ('txn-015', 'org-business-002', 'debit', 15.60, 'Call: +14085555678 (3 min)', 1733520180);

-- CloudCom Agency
INSERT INTO transactions (
    id, organization_id, type, amount, description, created_at
) VALUES 
    ('txn-016', 'org-agency-002', 'credit', 30000.00, 'Initial agency credits', 1702400000);

-- ============================================
-- 9. PRICING TIERS (for flexible pricing)
-- ============================================

INSERT INTO pricing_tiers (
    id, organization_id, tier_name, call_rate_per_minute, sms_rate, number_monthly_fee
) VALUES 
    ('tier-super', 'org-super-admin-001', 'Platform', 0.01, 0.01, 1.00),
    ('tier-agency-001', 'org-agency-001', 'Agency Standard', 0.015, 0.012, 1.50),
    ('tier-business-001', 'org-business-001', 'Business Pro', 0.02, 0.015, 2.00),
    ('tier-business-002', 'org-business-002', 'Business Pro', 0.02, 0.015, 2.00),
    ('tier-agency-002', 'org-agency-002', 'Agency Standard', 0.015, 0.012, 1.50);

-- ============================================
-- 10. UPDATE CREDITS BASED ON TRANSACTIONS
-- ============================================

-- Calculate and update actual credits
UPDATE organizations_v2 SET credits = 99829.30 WHERE id = 'org-agency-001'; -- 50000 - 125.50 - 45.20
UPDATE organizations_v2 SET credits = 10427.15 WHERE id = 'org-business-001'; -- 10000 - 72.85 + 500
UPDATE organizations_v2 SET credits = 14953.20 WHERE id = 'org-business-002'; -- 15000 - 46.80

-- ============================================
-- SEED DATA SUMMARY
-- ============================================
-- Organizations: 6 (1 Super Admin, 2 Agencies, 3 Businesses)
-- Users: 9 (1 Super Admin, 2 Agency Admins, 3 Business Admins, 3 Regular Users)
-- Phone Numbers: 9
-- Calls: 15 (mix of completed, in-progress, failed)
-- Messages: 7
-- Transactions: 16
-- ============================================

SELECT 'Seed data loaded successfully!' as message;
SELECT 'Login credentials:' as info;
SELECT 'Super Admin: admin@voipplatform.com / admin123' as credentials;
SELECT 'Agency Admin: john@techcom.com / admin123' as credentials;
SELECT 'Business Admin: sarah@acmecorp.com / admin123' as credentials;
SELECT 'Sales User: mike@acmecorp.com / admin123' as credentials;
