import { Hono } from 'hono';
import { SignJWT, jwtVerify } from 'jose';

const app = new Hono();

// Simple hash using Web Crypto (Workers-compatible)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Helper to create JWT
async function createToken(userId, secret) {
    const encoder = new TextEncoder();
    const jwt = await new SignJWT({ id: userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(encoder.encode(secret));
    return jwt;
}

// Register
app.post('/register', async (c) => {
    try {
        const { email, password } = await c.req.json();
        const db = c.env.DB;

        // Check if user exists
        const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) {
            return c.json({ error: 'User already exists' }, 400);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create organization
        const orgId = crypto.randomUUID();
        await db.prepare(
            'INSERT INTO organizations (id, name, credits) VALUES (?, ?, ?)'
        ).bind(orgId, `${email}'s Organization`, 10.0).run();

        // Create user
        const userId = crypto.randomUUID();
        await db.prepare(
            'INSERT INTO users (id, email, password, organization_id, role) VALUES (?, ?, ?, ?, ?)'
        ).bind(userId, email, hashedPassword, orgId, 'user').run();

        // Generate token
        const token = await createToken(userId, c.env.JWT_SECRET);

        return c.json({
            user: { id: userId, email, role: 'user' },
            token,
        }, 201);
    } catch (error) {
        console.error('Register error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// Login
app.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        const db = c.env.DB;

        // Find user
        const user = await db.prepare(
            'SELECT id, email, password, role, organization_id FROM users WHERE email = ?'
        ).bind(email).first();

        if (!user) {
            return c.json({ error: 'Invalid credentials' }, 400);
        }

        // Check password
        const hashedPassword = await hashPassword(password);
        if (hashedPassword !== user.password) {
            return c.json({ error: 'Invalid credentials' }, 400);
        }

        // Generate token
        const token = await createToken(user.id, c.env.JWT_SECRET);

        return c.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organization_id: user.organization_id
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// Get current user
app.get('/me', async (c) => {
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
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organization_id: user.organization_id
            }
        });
    } catch (error) {
        console.error('Auth error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
});

export default app;
