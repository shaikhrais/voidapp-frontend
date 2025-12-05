import { Hono } from 'hono';
import { jwtVerify } from 'jose';

const app = new Hono();

// Auth middleware
async function authMiddleware(c, next) {
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
            'SELECT id, organization_id FROM users WHERE id = ?'
        ).bind(payload.id).first();

        if (!user) {
            return c.json({ error: 'User not found' }, 401);
        }

        c.set('userId', user.id);
        c.set('organizationId', user.organization_id);
        await next();
    } catch (error) {
        return c.json({ error: 'Invalid token' }, 401);
    }
}

// Get balance
app.get('/balance', authMiddleware, async (c) => {
    try {
        const organizationId = c.get('organizationId');
        const db = c.env.DB;

        const org = await db.prepare(
            'SELECT credits FROM organizations WHERE id = ?'
        ).bind(organizationId).first();

        return c.json({ balance: org?.credits || 0 });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// Get usage
app.get('/usage', authMiddleware, async (c) => {
    try {
        const organizationId = c.get('organizationId');
        const db = c.env.DB;

        const calls = await db.prepare(
            'SELECT COUNT(*) as count FROM calls WHERE organization_id = ?'
        ).bind(organizationId).first();

        const messages = await db.prepare(
            'SELECT COUNT(*) as count FROM messages WHERE organization_id = ?'
        ).bind(organizationId).first();

        return c.json({
            calls: calls?.count || 0,
            messages: messages?.count || 0
        });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// Checkout (placeholder - Stripe integration needed)
app.post('/checkout', authMiddleware, async (c) => {
    return c.json({
        message: 'Stripe checkout not yet implemented',
        note: 'This requires Stripe API integration'
    }, 501);
});

export default app;
