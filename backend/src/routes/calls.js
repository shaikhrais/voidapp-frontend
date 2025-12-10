import { Hono } from 'hono';
import { jwtVerify } from 'jose';

const calls = new Hono();

// Auth middleware
calls.use('*', async (c, next) => {
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

// Get recent calls
calls.get('/recent', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        console.log('Fetching recent calls for user:', user.email, 'role:', user.role);

        // Super admin can see all calls, others see only their own calls
        let query = 'SELECT * FROM calls';
        let result;

        if (user.role !== 'super_admin' && user.role !== 'admin' && user.role !== 'business_admin' && user.role !== 'agency_admin') {
            // Regular users see only their own calls
            query += ' WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
            result = await db.prepare(query).bind(user.id).all();
        } else if (user.role === 'admin' || user.role === 'business_admin' || user.role === 'agency_admin') {
            // Admins see all calls in their organization
            query += ' WHERE organization_id = ? ORDER BY created_at DESC LIMIT 50';
            result = await db.prepare(query).bind(user.organization_id).all();
        } else {
            // Super admin sees all calls
            query += ' ORDER BY created_at DESC LIMIT 50';
            result = await db.prepare(query).all();
        }

        console.log('Found calls:', result.results?.length || 0);

        return c.json({
            success: true,
            calls: result.results || []
        });
    } catch (error) {
        console.error('Get recent calls error:', error);
        console.error('Error stack:', error.stack);
        return c.json({ error: 'Failed to fetch calls: ' + error.message }, 500);
    }
});

// Log a call
calls.post('/log', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const body = await c.req.json();

        console.log('Logging call - User:', user.email, 'Body:', JSON.stringify(body));

        const { sid, from_number, to_number, direction } = body;

        const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        console.log('Inserting call:', callId, 'SID:', sid, 'From:', from_number, 'To:', to_number);

        await db.prepare(`
            INSERT INTO calls (
                id, sid, from_number, to_number, status, direction,
                organization_id, user_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            callId,
            sid,
            from_number,
            to_number,
            'initiated',
            direction,
            user.organization_id,
            user.id,
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000)
        ).run();

        console.log('Call logged successfully:', callId);

        return c.json({
            success: true,
            callId,
            sid
        });
    } catch (error) {
        console.error('Log call error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        return c.json({ error: 'Failed to log call: ' + error.message }, 500);
    }
});

// Update call status
calls.put('/update/:sid', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { sid } = c.req.param();
        const body = await c.req.json();
        const { status, duration, sid: newSid } = body;

        console.log('Updating call:', sid, 'Body:', JSON.stringify(body));

        // If updating the SID itself (from temp to real Twilio SID)
        if (newSid && newSid !== sid) {
            await db.prepare(`
                UPDATE calls 
                SET sid = ?, 
                    status = ?,
                    updated_at = ?
                WHERE sid = ? AND user_id = ?
            `).bind(
                newSid,
                status || 'ringing',
                Math.floor(Date.now() / 1000),
                sid,
                user.id
            ).run();

            console.log('Call SID updated from', sid, 'to', newSid);
        } else {
            // Regular status/duration update
            await db.prepare(`
                UPDATE calls 
                SET status = ?, 
                    duration = ?,
                    updated_at = ?
                WHERE sid = ? AND user_id = ?
            `).bind(
                status,
                duration || 0,
                Math.floor(Date.now() / 1000),
                sid,
                user.id
            ).run();

            console.log('Call status updated to:', status);
        }

        return c.json({
            success: true
        });
    } catch (error) {
        console.error('Update call error:', error);
        return c.json({ error: 'Failed to update call: ' + error.message }, 500);
    }
});

export default calls;
