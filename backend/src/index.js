import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS middleware
app.use('*', cors());

// Health check
app.get('/health', (c) => {
    return c.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'VOIP API is running on Cloudflare Workers',
        version: '2.1 - Testing deployment'
    });
});

// Test D1 connection
app.get('/test-db', async (c) => {
    try {
        const db = c.env.DB;
        const result = await db.prepare('SELECT 1 as test').first();
        return c.json({ success: true, result });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// Placeholder for API routes
app.all('/api/*', (c) => {
    return c.json({
        message: 'API endpoints under development',
        path: c.req.path
    }, 501);
});

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
});

export default app;
