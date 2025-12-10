-- Simple test - just organizations and users
INSERT INTO organizations_v2 (
    id, name, type, parent_organization_id, owner_user_id,
    credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee,
    status, created_at, updated_at
) VALUES (
    'org-test-001',
    'Test Organization',
    'business',
    NULL,
    NULL,
    1000.00,
    'test@example.com',
    0.02,
    0.015,
    2.00,
    'active',
    1702000000,
    1702000000
);

INSERT INTO users (
    id, email, password, role, organization_id, created_at, updated_at
) VALUES (
    'user-test-001',
    'test@example.com',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'business_admin',
    'org-test-001',
    1702000000,
    1702000000
);

UPDATE organizations_v2 SET owner_user_id = 'user-test-001' WHERE id = 'org-test-001';

SELECT 'Test data loaded!' as message;
