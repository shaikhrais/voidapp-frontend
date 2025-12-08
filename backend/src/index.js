import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SignJWT, jwtVerify } from 'jose';
import syncRoutes from './routes/sync.js';
import voiceRoutes from './routes/voice.js';
import adminRoutes from './routes/admin.js';

const app = new Hono();

// CORS middleware
app.use('*', cors());

// Helper functions
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function createToken(userId, secret) {
    const encoder = new TextEncoder();
    const jwt = await new SignJWT({ id: userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(encoder.encode(secret));
    return jwt;
}

async function verifyToken(token, secret) {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return payload;
}

// Health check
app.get('/health', (c) => {
    return c.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'VOIP API on Cloudflare Workers',
        version: '4.0',
        database: 'D1 (SQLite)',
        features: ['Auth', 'Billing', 'Organizations']
    });
});

// Test D1 connection
app.get('/test-db', async (c) => {
    try {
        const db = c.env.DB;
        const result = await db.prepare('SELECT COUNT(*) as count FROM users').first();
        return c.json({ success: true, userCount: result.count });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// Auth - Register
app.post('/api/auth/register', async (c) => {
    try {
        const { email, password } = await c.req.json();
        const db = c.env.DB;

        // Check if user exists
        const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) {
            return c.json({ error: 'User already exists' }, 400);
        }

        const hashedPassword = await hashPassword(password);
        const userId = crypto.randomUUID();
        const orgId = crypto.randomUUID();

        // Create organization
        await db.prepare(
            'INSERT INTO organizations (id, name, credits, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(orgId, `${email}'s Organization`, 10.0, Date.now(), Date.now()).run();

        // Create user
        await db.prepare(
            'INSERT INTO users (id, email, password, organization_id, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(userId, email, hashedPassword, orgId, 'user', Date.now(), Date.now()).run();

        const token = await createToken(userId, c.env.JWT_SECRET);

        return c.json({
            user: { id: userId, email, role: 'user', organizationId: orgId },
            token
        }, 201);
    } catch (error) {
        console.error('Register error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// Auth - Login
app.post('/api/auth/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        const db = c.env.DB;

        const user = await db.prepare(
            'SELECT id, email, password, role, organization_id FROM users WHERE email = ?'
        ).bind(email).first();

        if (!user) {
            return c.json({ error: 'Invalid credentials' }, 400);
        }

        const hashedPassword = await hashPassword(password);
        if (hashedPassword !== user.password) {
            return c.json({ error: 'Invalid credentials' }, 400);
        }

        const token = await createToken(user.id, c.env.JWT_SECRET);

        return c.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organization_id
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// Auth - Get current user
app.get('/api/auth/me', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            return c.json({ error: 'Authentication required' }, 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const payload = await verifyToken(token, c.env.JWT_SECRET);

        const db = c.env.DB;
        const user = await db.prepare(
            'SELECT id, email, role, organization_id FROM users WHERE id = ?'
        ).bind(payload.id).first();

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organization_id
            }
        });
    } catch (error) {
        console.error('Auth error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
});

// Billing - Get balance
app.get('/api/billing/balance', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            return c.json({ error: 'Authentication required' }, 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const payload = await verifyToken(token, c.env.JWT_SECRET);

        const db = c.env.DB;
        const user = await db.prepare(
            'SELECT organization_id FROM users WHERE id = ?'
        ).bind(payload.id).first();

        if (!user) {
            return c.json({ error: 'User not found' }, 401);
        }

        const org = await db.prepare(
            'SELECT credits FROM organizations WHERE id = ?'
        ).bind(user.organization_id).first();

        return c.json({ balance: org?.credits || 0 });
    } catch (error) {
        console.error('Balance error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
});

// Billing - Get usage
app.get('/api/billing/usage', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            return c.json({ error: 'Authentication required' }, 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const payload = await verifyToken(token, c.env.JWT_SECRET);

        const db = c.env.DB;
        const user = await db.prepare(
            'SELECT organization_id FROM users WHERE id = ?'
        ).bind(payload.id).first();

        if (!user) {
            return c.json({ error: 'User not found' }, 401);
        }

        const calls = await db.prepare(
            'SELECT COUNT(*) as count FROM calls WHERE organization_id = ?'
        ).bind(user.organization_id).first();

        const messages = await db.prepare(
            'SELECT COUNT(*) as count FROM messages WHERE organization_id = ?'
        ).bind(user.organization_id).first();

        return c.json({
            calls: calls?.count || 0,
            messages: messages?.count || 0
        });
    } catch (error) {
        console.error('Usage error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
});

// Sync routes (Twilio integration)
app.route('/api/sync', syncRoutes);

// Voice routes (Twilio Voice SDK)
app.route('/api/voice', voiceRoutes);

// Admin routes (Super Admin only)
app.route('/api/admin', adminRoutes);

// Numbers endpoint
app.get('/api/numbers', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            return c.json({ error: 'Authentication required' }, 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const payload = await verifyToken(token, c.env.JWT_SECRET);

        const db = c.env.DB;
        const user = await db.prepare(
            'SELECT organization_id FROM users WHERE id = ?'
        ).bind(payload.id).first();

        if (!user) {
            return c.json({ error: 'User not found' }, 401);
        }

        const numbers = await db.prepare(
            'SELECT * FROM phone_numbers WHERE organization_id = ? ORDER BY created_at DESC'
        ).bind(user.organization_id).all();

        return c.json({
            numbers: numbers.results || []
        });
    } catch (error) {
        console.error('Numbers error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
});

// Placeholder routes
app.all('/api/calls*', (c) => c.json({ message: 'Calls - Coming soon' }, 501));
app.all('/api/sms*', (c) => c.json({ message: 'SMS - Coming soon' }, 501));
app.all('/api/organizations*', (c) => c.json({ message: 'Organizations - Coming soon' }, 501));
app.all('/api/keys*', (c) => c.json({ message: 'API Keys - Coming soon' }, 501));
app.post('/api/billing/checkout', (c) => c.json({ message: 'Stripe checkout - Coming soon' }, 501));

// 404
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
