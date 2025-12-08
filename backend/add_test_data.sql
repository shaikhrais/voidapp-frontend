-- Add test user
INSERT INTO users (id, email, password, created_at) 
VALUES ('user-001', 'itpro.mohammed@gmail.com', '$2a$10$dummyhashfordevpurposes', datetime('now')) 
ON CONFLICT(email) DO NOTHING;

-- Add phone number
INSERT INTO phone_numbers (id, user_id, phone_number, friendly_name, sid, capabilities, type, locality, created_at) 
VALUES (
    'num-001', 
    'user-001', 
    '+16479302223', 
    '(647) 930-2223', 
    'PN14d5f063ed5b5412c444922d3a4b4fd1', 
    'Voice, SMS, MMS, Fax, SIP', 
    'Local', 
    'Toronto, ON, CA', 
    datetime('now')
) 
ON CONFLICT(phone_number) DO NOTHING;

-- Add billing record with $10 balance
INSERT INTO billing (id, user_id, balance, created_at, updated_at) 
VALUES ('bill-001', 'user-001', 10.00, datetime('now'), datetime('now')) 
ON CONFLICT(user_id) DO UPDATE SET balance = 10.00;
