import { Hono } from 'hono';
import { SignJWT, jwtVerify } from 'jose';
import { getDB, generateId } from '../db';
import { users, organizations } from '../schema';
import { eq } from 'drizzle-orm';

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
        const db = getDB(c.env);

        // Check if user exists
        const existing = await db.select().from(users).where(eq(users.email, email)).get();
        if (existing) {
            return c.json({ error: 'User already exists' }, 400);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create organization
        const orgId = generateId();
        await db.insert(organizations).values({
            id: orgId,
            name: `${email}'s Organization`,
            credits: 10.0,
        });

        // Create user
        const userId = generateId();
        await db.insert(users).values({
            id: userId,
            email,
            password: hashedPassword,
            organizationId: orgId,
        });

        // Generate token
        const token = await createToken(userId, c.env.JWT_SECRET);

        return c.json({
            user: { id: userId, email, role: 'user' },
            token,
        }, 201);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// Login
app.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        const db = getDB(c.env);

        // Find user
        const user = await db.select().from(users).where(eq(users.email, email)).get();
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
            user: { id: user.id, email: user.email, role: user.role },
            token,
        });
    } catch (error) {
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

        const db = getDB(c.env);
        const user = await db.select({
            id: users.id,
            email: users.email,
            role: users.role,
            organizationId: users.organizationId,
        }).from(users).where(eq(users.id, payload.id)).get();

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json({ user });
    } catch (error) {
        return c.json({ error: 'Invalid token' }, 401);
    }
});

export default app;
