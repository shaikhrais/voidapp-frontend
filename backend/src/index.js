// Main Application Entry Point
// Clean, modular structure - all routes are in separate modules

import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import route modules
import authRoutes from './routes/auth.js';
import billingRoutes from './routes/billing.js';
import callsRoutes from './routes/calls.js';
import smsRoutes from './routes/sms.js';
import numbersRoutes from './routes/numbers.js';
import syncRoutes from './routes/sync.js';
import voiceRoutes from './routes/voice.js';
import adminRoutes from './routes/admin.js';
import agencyRoutes from './routes/agency.js';
import businessRoutes from './routes/business.js';
import organizationsRoutes from './routes/organizations.js';
import webhooksRoutes from './routes/webhooks.js';

const app = new Hono();

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Allow all origins for development
app.use('*', cors());

// Request logging (optional)
app.use('*', async (c, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${c.req.method} ${c.req.url} - ${ms}ms`);
});

// ============================================
// HEALTH & STATUS ENDPOINTS
// ============================================

app.get('/health', (c) => {
    return c.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'VOIP SaaS API - Modular Architecture',
        version: '5.0',
        database: 'Cloudflare D1 (SQLite)',
        features: [
            'Authentication',
            'Multi-Tier Organizations',
            'Billing & Credits',
            'Twilio Voice & SMS',
            'Call Recording',
            'Usage Analytics',
            'Admin Dashboard'
        ]
    });
});

app.get('/test-db', async (c) => {
    try {
        const db = c.env.DB;
        const result = await db.prepare('SELECT COUNT(*) as count FROM users').first();
        return c.json({
            success: true,
            userCount: result.count,
            database: 'Connected'
        });
    } catch (error) {
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});

// ============================================
// API ROUTES - Modular Structure
// ============================================

// Authentication
app.route('/api/auth', authRoutes);

// Billing & Credits
app.route('/api/billing', billingRoutes);

// Calls
app.route('/api/calls', callsRoutes);

// SMS/Messages
app.route('/api/sms', smsRoutes);

// Phone Numbers
app.route('/api/numbers', numbersRoutes);

// Twilio Sync
app.route('/api/sync', syncRoutes);

// Voice (Twilio Voice SDK)
app.route('/api/voice', voiceRoutes);

// Organizations
app.route('/api/organizations', organizationsRoutes);

// Webhooks (Twilio callbacks)
app.route('/api/webhooks', webhooksRoutes);

// Admin Routes (Super Admin only)
app.route('/api/admin', adminRoutes);

// Agency Routes (Agency Admin)
app.route('/api/agency', agencyRoutes);

// Business Routes (Business Admin)
app.route('/api/business', businessRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.notFound((c) => {
    return c.json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        path: c.req.url
    }, 404);
});

// ============================================
// ERROR HANDLER
// ============================================

app.onError((err, c) => {
    console.error('Global error handler:', err);
    return c.json({
        error: 'Internal Server Error',
        message: err.message
    }, 500);
});

// ============================================
// EXPORT
// ============================================

export default app;
