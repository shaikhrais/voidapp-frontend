import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SignJWT, jwtVerify } from 'jose';

const app = new Hono();

// In-memory storage (for demo - will reset on deployment)
const users = new Map();
const organizations = new Map();

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
        version: '3.0',
        note: 'Using in-memory storage (demo mode)'
    });
});

// Auth routes
app.post('/api/auth/register', async (c) => {
    try {
        const { email, password } = await c.req.json();

        if (users.has(email)) {
            return c.json({ error: 'User already exists' }, 400);
        }

        const hashedPassword = await hashPassword(password);
        const userId = crypto.randomUUID();
        const orgId = crypto.randomUUID();

        organizations.set(orgId, {
            id: orgId,
            name: `${email}'s Organization`,
            credits: 10.0
        });

        users.set(email, {
            id: userId,
            email,
            password: hashedPassword,
            role: 'user',
            organizationId: orgId
        });

        const token = await createToken(userId, c.env.JWT_SECRET);

        return c.json({
            user: { id: userId, email, role: 'user' },
            token
        }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

app.post('/api/auth/login', async (c) => {
    try {
        const { email, password } = await c.req.json();

        const user = users.get(email);
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
                organizationId: user.organizationId
            },
            token
        });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

app.get('/api/auth/me', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            return c.json({ error: 'Authentication required' }, 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const payload = await verifyToken(token, c.env.JWT_SECRET);

        const user = Array.from(users.values()).find(u => u.id === payload.id);
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            }
        });
    } catch (error) {
        return c.json({ error: 'Invalid token' }, 401);
    }
});

// Billing routes
app.get('/api/billing/balance', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            return c.json({ error: 'Authentication required' }, 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const payload = await verifyToken(token, c.env.JWT_SECRET);
        const user = Array.from(users.values()).find(u => u.id === payload.id);

        if (!user) {
            return c.json({ error: 'User not found' }, 401);
        }

        const org = organizations.get(user.organizationId);
        return c.json({ balance: org?.credits || 0 });
    } catch (error) {
        return c.json({ error: 'Invalid token' }, 401);
    }
});

app.get('/api/billing/usage', async (c) => {
    return c.json({ calls: 0, messages: 0 });
});

// Placeholder routes
app.all('/api/numbers*', (c) => c.json({ message: 'Numbers - Coming soon' }, 501));
app.all('/api/calls*', (c) => c.json({ message: 'Calls - Coming soon' }, 501));
app.all('/api/sms*', (c) => c.json({ message: 'SMS - Coming soon' }, 501));
app.all('/api/organizations*', (c) => c.json({ message: 'Organizations - Coming soon' }, 501));
app.all('/api/keys*', (c) => c.json({ message: 'API Keys - Coming soon' }, 501));

// 404
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
