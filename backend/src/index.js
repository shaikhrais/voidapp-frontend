import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import routes
import authRoutes from './routes/auth';
import billingRoutes from './routes/billing';

const app = new Hono();

// CORS middleware
app.use('*', cors());

// Health check
app.get('/health', (c) => {
    return c.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'VOIP API is running on Cloudflare Workers',
        version: '2.0'
    });
});

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/billing', billingRoutes);

// Placeholder for other endpoints
app.all('/api/numbers*', (c) => {
    return c.json({ message: 'Numbers endpoint - Coming soon' }, 501);
});

app.all('/api/calls*', (c) => {
    return c.json({ message: 'Calls endpoint - Coming soon' }, 501);
});

app.all('/api/sms*', (c) => {
    return c.json({ message: 'SMS endpoint - Coming soon' }, 501);
});

app.all('/api/organizations*', (c) => {
    return c.json({ message: 'Organizations endpoint - Coming soon' }, 501);
});

app.all('/api/keys*', (c) => {
    return c.json({ message: 'API Keys endpoint - Coming soon' }, 501);
});

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
});

export default app;
