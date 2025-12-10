-- Update existing super admin user with new password
UPDATE users 
SET password = '0705c29f67eb09d03fbcd2e25a2c0d154d25e161a2649dba68d1123c1c9cb8f5'
WHERE email = 'itpro.mohammed@gmail.com';

-- Verify the update
SELECT id, email, role, organization_id FROM users WHERE email = 'itpro.mohammed@gmail.com';
