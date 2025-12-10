-- Simplified Seed Data matching current schema
-- Super Admin (already exists from schema)

-- Agency 1: TechCom Solutions
INSERT INTO organizations_v2 (id, name, type, parent_organization_id, owner_user_id, credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee, status, created_at, updated_at)
VALUES ('org-agency-001', 'TechCom Solutions', 'agency', 'org-super-admin', NULL, 50000.00, 'billing@techcom.com', 0.015, 0.012, 1.50, 'active', unixepoch(), unixepoch());

-- Agency Admin
INSERT INTO users (id, email, password, role, organization_id, created_at, updated_at)
VALUES ('user-agency-admin-001', 'john@techcom.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'agency_admin', 'org-agency-001', unixepoch(), unixepoch());

UPDATE organizations_v2 SET owner_user_id = 'user-agency-admin-001' WHERE id = 'org-agency-001';

INSERT INTO user_permissions (user_id, full_name, can_make_calls, can_send_sms, can_buy_numbers, can_manage_users, can_view_billing)
VALUES ('user-agency-admin-001', 'John Smith', 1, 1, 1, 1, 1);

-- Business 1: Acme Corp (under TechCom)
INSERT INTO organizations_v2 (id, name, type, parent_organization_id, owner_user_id, credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee, status, created_at, updated_at)
VALUES ('org-business-001', 'Acme Corporation', 'business', 'org-agency-001', NULL, 10000.00, 'billing@acmecorp.com', 0.02, 0.015, 2.00, 'active', unixepoch(), unixepoch());

-- Business Admin
INSERT INTO users (id, email, password, role, organization_id, created_at, updated_at)
VALUES ('user-business-admin-001', 'sarah@acmecorp.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'business_admin', 'org-business-001', unixepoch(), unixepoch());

UPDATE organizations_v2 SET owner_user_id = 'user-business-admin-001' WHERE id = 'org-business-001';

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

-- Calls
INSERT INTO calls (id, sid, from_number, to_number, status, direction, duration, organization_id, created_at, updated_at)
VALUES 
    ('call-001', 'CA001', '+14155552001', '+14085551234', 'completed', 'outbound', 180, 'org-business-001', unixepoch(), unixepoch()),
    ('call-002', 'CA002', '+14155552001', '+14085555678', 'completed', 'outbound', 240, 'org-business-001', unixepoch(), unixepoch()),
    ('call-003', 'CA003', '+14155552002', '+14085559999', 'completed', 'outbound', 120, 'org-business-001', unixepoch(), unixepoch());

-- Messages
INSERT INTO messages (id, sid, from_number, to_number, body, status, direction, organization_id, created_at, updated_at)
VALUES 
    ('msg-001', 'SM001', '+14155552001', '+14085551234', 'Hi! Thanks for your interest in our product.', 'delivered', 'outbound', 'org-business-001', unixepoch(), unixepoch()),
    ('msg-002', 'SM002', '+14085551234', '+14155552001', 'Tomorrow at 2pm works for me', 'received', 'inbound', 'org-business-001', unixepoch(), unixepoch());

-- Transactions
INSERT INTO transactions (id, organization_id, amount, type, description, created_at)
VALUES 
    ('txn-001', 'org-agency-001', 50000.00, 'credit', 'Initial agency credits', unixepoch()),
    ('txn-002', 'org-business-001', 10000.00, 'credit', 'Initial business credits', unixepoch()),
    ('txn-003', 'org-business-001', 15.60, 'debit', 'Call usage', unixepoch());

-- Pricing Tiers
INSERT INTO pricing_tiers (id, organization_id, name, call_rate_per_minute, sms_rate, number_monthly_fee, created_at)
VALUES 
    ('tier-agency-001', 'org-agency-001', 'Agency Standard', 0.015, 0.012, 1.50, unixepoch()),
    ('tier-business-001', 'org-business-001', 'Business Pro', 0.02, 0.015, 2.00, unixepoch());

SELECT 'Seed data loaded successfully!' as message;
