-- Fix super admin role for itpro.mohammed@gmail.com
-- The users table CHECK constraint only allows: 'user', 'admin'
-- So we'll use 'admin' as the role

-- Update user role to admin (highest available role)
UPDATE users 
SET role = 'admin', 
    organization_id = 'org-super-admin'
WHERE email = 'itpro.mohammed@gmail.com';

-- Ensure permissions exist
INSERT OR IGNORE INTO user_permissions (
    user_id,
    full_name,
    can_make_calls,
    can_send_sms,
    can_buy_numbers,
    can_manage_users,
    can_view_billing,
    created_at,
    updated_at
)
SELECT 
    id,
    'Mohammed (Super Admin)',
    1, 1, 1, 1, 1,
    unixepoch(),
    unixepoch()
FROM users
WHERE email = 'itpro.mohammed@gmail.com';

-- Update existing permissions if they exist
UPDATE user_permissions
SET can_make_calls = 1,
    can_send_sms = 1,
    can_buy_numbers = 1,
    can_manage_users = 1,
    can_view_billing = 1,
    full_name = 'Mohammed (Super Admin)',
    updated_at = unixepoch()
WHERE user_id IN (SELECT id FROM users WHERE email = 'itpro.mohammed@gmail.com');
