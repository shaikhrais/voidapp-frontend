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
        message: 'VOIP API is running on Cloudflare Workers'
    });
});

// Simple auth endpoint (placeholder)
app.post('/api/auth/register', async (c) => {
    return c.json({
        message: 'Registration endpoint - Coming soon',
        note: 'Full implementation requires D1 database setup'
    }, 501);
});

app.post('/api/auth/login', async (c) => {
    return c.json({
        message: 'Login endpoint - Coming soon',
        note: 'Full implementation requires D1 database setup'
    }, 501);
});

// Placeholder for other endpoints
app.all('/api/*', (c) => {
    return c.json({
        message: 'API endpoint under development',
        path: c.req.path
    }, 501);
});

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
});

export default app;
