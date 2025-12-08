-- Add test calls
INSERT OR IGNORE INTO calls (id, sid, from_number, to_number, status, direction, duration, organization_id, created_at, updated_at) 
VALUES 
    ('call-001', 'CA001', '+16479302223', '+14165551234', 'completed', 'outbound', 125, 'org-001', unixepoch() - 86400, unixepoch() - 86400),
    ('call-002', 'CA002', '+14165559876', '+16479302223', 'completed', 'inbound', 87, 'org-001', unixepoch() - 43200, unixepoch() - 43200),
    ('call-003', 'CA003', '+16479302223', '+14165552468', 'completed', 'outbound', 203, 'org-001', unixepoch() - 21600, unixepoch() - 21600),
    ('call-004', 'CA004', '+14165553690', '+16479302223', 'completed', 'inbound', 45, 'org-001', unixepoch() - 10800, unixepoch() - 10800),
    ('call-005', 'CA005', '+16479302223', '+14165554321', 'completed', 'outbound', 156, 'org-001', unixepoch() - 7200, unixepoch() - 7200),
    ('call-006', 'CA006', '+14165555555', '+16479302223', 'no-answer', 'inbound', 0, 'org-001', unixepoch() - 3600, unixepoch() - 3600),
    ('call-007', 'CA007', '+16479302223', '+14165556789', 'completed', 'outbound', 312, 'org-001', unixepoch() - 1800, unixepoch() - 1800),
    ('call-008', 'CA008', '+14165557890', '+16479302223', 'completed', 'inbound', 98, 'org-001', unixepoch() - 900, unixepoch() - 900);

-- Add test SMS messages
INSERT OR IGNORE INTO messages (id, sid, from_number, to_number, body, status, direction, organization_id, created_at, updated_at) 
VALUES 
    ('msg-001', 'SM001', '+16479302223', '+14165551234', 'Hi, this is a test message from our VOIP system!', 'delivered', 'outbound', 'org-001', unixepoch() - 86400, unixepoch() - 86400),
    ('msg-002', 'SM002', '+14165559876', '+16479302223', 'Thanks for reaching out! When can we schedule a call?', 'received', 'inbound', 'org-001', unixepoch() - 82800, unixepoch() - 82800),
    ('msg-003', 'SM003', '+16479302223', '+14165559876', 'How about tomorrow at 2 PM?', 'delivered', 'outbound', 'org-001', unixepoch() - 79200, unixepoch() - 79200),
    ('msg-004', 'SM004', '+14165552468', '+16479302223', 'Your appointment is confirmed for tomorrow.', 'received', 'inbound', 'org-001', unixepoch() - 43200, unixepoch() - 43200),
    ('msg-005', 'SM005', '+16479302223', '+14165552468', 'Perfect! See you then.', 'delivered', 'outbound', 'org-001', unixepoch() - 39600, unixepoch() - 39600),
    ('msg-006', 'SM006', '+14165553690', '+16479302223', 'Meeting reminder: 30 minutes until our call', 'received', 'inbound', 'org-001', unixepoch() - 21600, unixepoch() - 21600),
    ('msg-007', 'SM007', '+16479302223', '+14165554321', 'Thanks for your business! Let us know if you need anything.', 'delivered', 'outbound', 'org-001', unixepoch() - 10800, unixepoch() - 10800),
    ('msg-008', 'SM008', '+14165555555', '+16479302223', 'Can you send me the invoice?', 'received', 'inbound', 'org-001', unixepoch() - 7200, unixepoch() - 7200),
    ('msg-009', 'SM009', '+16479302223', '+14165555555', 'Invoice sent to your email!', 'delivered', 'outbound', 'org-001', unixepoch() - 3600, unixepoch() - 3600),
    ('msg-010', 'SM010', '+14165556789', '+16479302223', 'Great service! Will recommend to others.', 'received', 'inbound', 'org-001', unixepoch() - 1800, unixepoch() - 1800);
