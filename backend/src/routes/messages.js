import { Hono } from 'hono';
import { jwtVerify } from 'jose';
import { createTwilioClient } from '../twilio.js';

const messages = new Hono();

// Auth middleware
messages.use('*', async (c, next) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            return c.json({ error: 'Authentication required' }, 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const encoder = new TextEncoder();
        const { payload } = await jwtVerify(token, encoder.encode(c.env.JWT_SECRET));

        const db = c.env.DB;
        const user = await db.prepare(
            'SELECT id, email, role, organization_id FROM users WHERE id = ?'
        ).bind(payload.id).first();

        if (!user) {
            return c.json({ error: 'User not found' }, 401);
        }

        c.set('user', user);
        await next();
    } catch (error) {
        console.error('Auth error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
});

// Get recent messages
messages.get('/recent', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        console.log('Fetching recent messages for user:', user.email);

        let query = 'SELECT * FROM messages';
        let result;

        if (user.role !== 'super_admin' && user.role !== 'admin') {
            // Regular users see only their own messages
            query += ' WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
            result = await db.prepare(query).bind(user.id).all();
        } else if (user.role === 'admin') {
            // Admins see all messages in their organization
            query += ' WHERE organization_id = ? ORDER BY created_at DESC LIMIT 50';
            result = await db.prepare(query).bind(user.organization_id).all();
        } else {
            // Super admin sees all messages
            query += ' ORDER BY created_at DESC LIMIT 50';
            result = await db.prepare(query).all();
        }

        return c.json({
            success: true,
            messages: result.results || []
        });
    } catch (error) {
        console.error('Get recent messages error:', error);
        return c.json({ error: 'Failed to fetch messages: ' + error.message }, 500);
    }
});

// Get conversation with specific number
messages.get('/conversation/:phoneNumber', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { phoneNumber } = c.req.param();

        console.log('Fetching conversation with:', phoneNumber);

        const result = await db.prepare(`
            SELECT * FROM messages 
            WHERE user_id = ? 
            AND (from_number = ? OR to_number = ?)
            ORDER BY created_at ASC
        `).bind(user.id, phoneNumber, phoneNumber).all();

        return c.json({
            success: true,
            messages: result.results || []
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        return c.json({ error: 'Failed to fetch conversation: ' + error.message }, 500);
    }
});

// Send SMS message
messages.post('/send', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { from_number, to_number, body } = await c.req.json();

        console.log('Sending message from:', from_number, 'to:', to_number);

        // Send via Twilio
        const twilio = createTwilioClient(c.env);
        const twilioMessage = await twilio.sendMessage(from_number, to_number, body);

        // Log message to database
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await db.prepare(`
            INSERT INTO messages (
                id, sid, from_number, to_number, body, status, direction,
                organization_id, user_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            messageId,
            twilioMessage.sid,
            from_number,
            to_number,
            body,
            twilioMessage.status,
            'outbound',
            user.organization_id,
            user.id,
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000)
        ).run();

        console.log('Message sent and logged:', messageId);

        return c.json({
            success: true,
            messageId,
            sid: twilioMessage.sid
        });
    } catch (error) {
        console.error('Send message error:', error);
        return c.json({ error: 'Failed to send message: ' + error.message }, 500);
    }
});

// Get list of conversations
messages.get('/conversations', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        console.log('Fetching conversations for user:', user.email);

        // Get unique phone numbers from messages
        const result = await db.prepare(`
            SELECT 
                CASE 
                    WHEN direction = 'outbound' THEN to_number 
                    ELSE from_number 
                END as contact_number,
                MAX(created_at) as last_message_time,
                COUNT(*) as message_count
            FROM messages 
            WHERE user_id = ?
            GROUP BY contact_number
            ORDER BY last_message_time DESC
        `).bind(user.id).all();

        return c.json({
            success: true,
            conversations: result.results || []
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        return c.json({ error: 'Failed to fetch conversations: ' + error.message }, 500);
    }
});

export default messages;
