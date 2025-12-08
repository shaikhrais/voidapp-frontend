import { Hono } from 'hono';
import { createTwilioClient } from '../twilio.js';

const sync = new Hono();

// Sync calls from Twilio
sync.post('/calls', async (c) => {
    try {
        const twilio = createTwilioClient(c.env);
        const db = c.env.DB;

        // Get user's organization
        const user = c.get('user');
        if (!user || !user.organization_id) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Fetch calls from Twilio
        const twilioData = await twilio.getCalls({ pageSize: 100 });
        const calls = twilioData.calls || [];

        let synced = 0;
        let errors = 0;

        // Insert calls into database
        for (const call of calls) {
            try {
                await db.prepare(`
                    INSERT OR REPLACE INTO calls (
                        id, sid, from_number, to_number, status, direction, 
                        duration, organization_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    `call-${call.sid}`,
                    call.sid,
                    call.from,
                    call.to,
                    call.status, // completed, no-answer, busy, failed, canceled
                    call.direction, // inbound, outbound
                    call.duration || 0,
                    user.organization_id,
                    new Date(call.date_created).getTime() / 1000,
                    Date.now() / 1000
                ).run();
                synced++;
            } catch (err) {
                console.error('Error inserting call:', err);
                errors++;
            }
        }

        return c.json({
            success: true,
            synced,
            errors,
            total: calls.length,
        });
    } catch (error) {
        console.error('Sync calls error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// Sync messages from Twilio
sync.post('/messages', async (c) => {
    try {
        const twilio = createTwilioClient(c.env);
        const db = c.env.DB;

        // Get user's organization
        const user = c.get('user');
        if (!user || !user.organization_id) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Fetch messages from Twilio
        const twilioData = await twilio.getMessages({ pageSize: 100 });
        const messages = twilioData.messages || [];

        let synced = 0;
        let errors = 0;

        // Insert messages into database
        for (const msg of messages) {
            try {
                await db.prepare(`
                    INSERT OR REPLACE INTO messages (
                        id, sid, from_number, to_number, body, status, 
                        direction, organization_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    `msg-${msg.sid}`,
                    msg.sid,
                    msg.from,
                    msg.to,
                    msg.body || '',
                    msg.status, // queued, sent, delivered, failed
                    msg.direction, // inbound, outbound-api, outbound-call, outbound-reply
                    user.organization_id,
                    new Date(msg.date_created).getTime() / 1000,
                    Date.now() / 1000
                ).run();
                synced++;
            } catch (err) {
                console.error('Error inserting message:', err);
                errors++;
            }
        }

        return c.json({
            success: true,
            synced,
            errors,
            total: messages.length,
        });
    } catch (error) {
        console.error('Sync messages error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// Sync phone numbers from Twilio
sync.post('/numbers', async (c) => {
    try {
        const twilio = createTwilioClient(c.env);
        const db = c.env.DB;

        // Get user's organization
        const user = c.get('user');
        if (!user || !user.organization_id) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Fetch phone numbers from Twilio
        const twilioData = await twilio.getPhoneNumbers();
        const numbers = twilioData.incoming_phone_numbers || [];

        let synced = 0;
        let errors = 0;

        // Insert phone numbers into database
        for (const number of numbers) {
            try {
                await db.prepare(`
                    INSERT OR REPLACE INTO phone_numbers (
                        id, sid, phone_number, friendly_name, 
                        organization_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    `num-${number.sid}`,
                    number.sid,
                    number.phone_number,
                    number.friendly_name,
                    user.organization_id,
                    new Date(number.date_created).getTime() / 1000,
                    Date.now() / 1000
                ).run();
                synced++;
            } catch (err) {
                console.error('Error inserting phone number:', err);
                errors++;
            }
        }

        return c.json({
            success: true,
            synced,
            errors,
            total: numbers.length,
        });
    } catch (error) {
        console.error('Sync numbers error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// Sync all (calls, messages, numbers)
sync.post('/all', async (c) => {
    try {
        const results = {
            calls: { synced: 0, errors: 0 },
            messages: { synced: 0, errors: 0 },
            numbers: { synced: 0, errors: 0 },
        };

        // Sync calls
        const callsResponse = await sync.request('/sync/calls', {
            method: 'POST',
            headers: c.req.headers,
        }, c.env);
        const callsData = await callsResponse.json();
        results.calls = { synced: callsData.synced || 0, errors: callsData.errors || 0 };

        // Sync messages
        const messagesResponse = await sync.request('/sync/messages', {
            method: 'POST',
            headers: c.req.headers,
        }, c.env);
        const messagesData = await messagesResponse.json();
        results.messages = { synced: messagesData.synced || 0, errors: messagesData.errors || 0 };

        // Sync numbers
        const numbersResponse = await sync.request('/sync/numbers', {
            method: 'POST',
            headers: c.req.headers,
        }, c.env);
        const numbersData = await numbersResponse.json();
        results.numbers = { synced: numbersData.synced || 0, errors: numbersData.errors || 0 };

        return c.json({
            success: true,
            results,
        });
    } catch (error) {
        console.error('Sync all error:', error);
        return c.json({ error: error.message }, 500);
    }
});

export default sync;
