-- Add organization first
INSERT OR IGNORE INTO organizations (id, name, credits, created_at, updated_at) 
VALUES ('org-001', 'Mohammed IT Pro', 10.00, unixepoch(), unixepoch());

-- Add test user
INSERT OR IGNORE INTO users (id, email, password, role, organization_id, created_at, updated_at) 
VALUES ('user-001', 'itpro.mohammed@gmail.com', '$2a$10$dummyhashfordevpurposes', 'user', 'org-001', unixepoch(), unixepoch());

-- Add phone number
INSERT OR IGNORE INTO phone_numbers (id, sid, phone_number, friendly_name, organization_id, created_at, updated_at) 
VALUES (
    'num-001', 
    'PN14d5f063ed5b5412c444922d3a4b4fd1',
    '+16479302223', 
    '(647) 930-2223',
    'org-001',
    unixepoch(),
    unixepoch()
);
