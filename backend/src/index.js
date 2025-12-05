import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/cloudflare-workers';

// Import routes
import authRoutes from './routes/auth';
import { organizations, numbers, calls, sms, billing, keys } from './routes/placeholders';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/organizations', organizations);
app.route('/api/numbers', numbers);
app.route('/api/calls', calls);
app.route('/api/sms', sms);
app.route('/api/billing', billing);
app.route('/api/keys', keys);

// Serve static frontend files
app.get('/assets/*', serveStatic({ root: './public' }));
app.get('/index.html', serveStatic({ path: './public/index.html' }));

// SPA fallback - serve index.html for all other routes
app.get('*', serveStatic({ path: './public/index.html' }));

export default app;
