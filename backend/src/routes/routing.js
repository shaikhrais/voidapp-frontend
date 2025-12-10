import { Hono } from 'hono';
import { jwtVerify } from 'jose';

const routing = new Hono();

// Auth middleware
routing.use('*', async (c, next) => {
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
            return c.json({ error: 'User not found' }, 401);
        }

        c.set('user', user);
        await next();
    } catch (error) {
        console.error('Auth error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
});

// Get routing configuration
routing.get('/config', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        let config = await db.prepare(
            'SELECT * FROM call_routing_config WHERE user_id = ?'
        ).bind(user.id).first();

        // Create default config if doesn't exist
        if (!config) {
            const defaultConfig = {
                id: `config-${user.id}`,
                user_id: user.id,
                organization_id: user.organization_id,
                routing_mode: 'simultaneous',
                ring_all_devices: 1,
                ring_timeout: 30,
                ai_enabled: 0,
                ai_provider: null,
                ai_greeting: 'Hello, I am an AI assistant. How can I help you today?',
                ai_can_transfer: 1,
                ai_take_messages: 1,
                business_hours_enabled: 0,
                business_hours_json: JSON.stringify({
                    monday: { start: '09:00', end: '17:00', enabled: true },
                    tuesday: { start: '09:00', end: '17:00', enabled: true },
                    wednesday: { start: '09:00', end: '17:00', enabled: true },
                    thursday: { start: '09:00', end: '17:00', enabled: true },
                    friday: { start: '09:00', end: '17:00', enabled: true },
                    saturday: { enabled: false },
                    sunday: { enabled: false }
                }),
                timezone: 'America/New_York',
                after_hours_mode: 'voicemail',
                after_hours_forward_to: null,
                fallback_chain: JSON.stringify([
                    { type: 'ring_devices', timeout: 30 },
                    { type: 'voicemail', timeout: 60 }
                ]),
                fallback_timeout: 30,
                voicemail_enabled: 1,
                voicemail_greeting: null,
                missed_call_sms: 1,
                missed_call_email: 1,
                created_at: Math.floor(Date.now() / 1000),
                updated_at: Math.floor(Date.now() / 1000)
            };

            await db.prepare(`
                INSERT INTO call_routing_config VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(...Object.values(defaultConfig)).run();

            config = defaultConfig;
        }

        // Parse JSON fields
        const parsedConfig = {
            ...config,
            business_hours_json: config.business_hours_json ? JSON.parse(config.business_hours_json) : null,
            fallback_chain: config.fallback_chain ? JSON.parse(config.fallback_chain) : []
        };

        return c.json({
            success: true,
            config: parsedConfig
        });
    } catch (error) {
        console.error('Get config error:', error);
        return c.json({ error: 'Failed to get configuration: ' + error.message }, 500);
    }
});

// Update routing configuration
routing.put('/config', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const body = await c.req.json();

        // Stringify JSON fields
        const config = {
            ...body,
            business_hours_json: body.business_hours_json ? JSON.stringify(body.business_hours_json) : null,
            fallback_chain: body.fallback_chain ? JSON.stringify(body.fallback_chain) : null,
            updated_at: Math.floor(Date.now() / 1000)
        };

        await db.prepare(`
            UPDATE call_routing_config 
            SET routing_mode = ?,
                ring_all_devices = ?,
                ring_timeout = ?,
                ai_enabled = ?,
                ai_provider = ?,
                ai_greeting = ?,
                ai_can_transfer = ?,
                ai_take_messages = ?,
                business_hours_enabled = ?,
                business_hours_json = ?,
                timezone = ?,
                after_hours_mode = ?,
                after_hours_forward_to = ?,
                fallback_chain = ?,
                fallback_timeout = ?,
                voicemail_enabled = ?,
                voicemail_greeting = ?,
                missed_call_sms = ?,
                missed_call_email = ?,
                updated_at = ?
            WHERE user_id = ?
        `).bind(
            config.routing_mode,
            config.ring_all_devices ? 1 : 0,
            config.ring_timeout,
            config.ai_enabled ? 1 : 0,
            config.ai_provider,
            config.ai_greeting,
            config.ai_can_transfer ? 1 : 0,
            config.ai_take_messages ? 1 : 0,
            config.business_hours_enabled ? 1 : 0,
            config.business_hours_json,
            config.timezone,
            config.after_hours_mode,
            config.after_hours_forward_to,
            config.fallback_chain,
            config.fallback_timeout,
            config.voicemail_enabled ? 1 : 0,
            config.voicemail_greeting,
            config.missed_call_sms ? 1 : 0,
            config.missed_call_email ? 1 : 0,
            config.updated_at,
            user.id
        ).run();

        return c.json({
            success: true,
            message: 'Configuration updated successfully'
        });
    } catch (error) {
        console.error('Update config error:', error);
        return c.json({ error: 'Failed to update configuration: ' + error.message }, 500);
    }
});

// Export configuration as JSON
routing.get('/export', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        const config = await db.prepare(
            'SELECT * FROM call_routing_config WHERE user_id = ?'
        ).bind(user.id).first();

        if (!config) {
            return c.json({ error: 'No configuration found' }, 404);
        }

        // Parse JSON fields and remove internal fields
        const exportConfig = {
            routing_mode: config.routing_mode,
            ring_all_devices: Boolean(config.ring_all_devices),
            ring_timeout: config.ring_timeout,
            ai_enabled: Boolean(config.ai_enabled),
            ai_provider: config.ai_provider,
            ai_greeting: config.ai_greeting,
            ai_can_transfer: Boolean(config.ai_can_transfer),
            ai_take_messages: Boolean(config.ai_take_messages),
            business_hours_enabled: Boolean(config.business_hours_enabled),
            business_hours: config.business_hours_json ? JSON.parse(config.business_hours_json) : null,
            timezone: config.timezone,
            after_hours_mode: config.after_hours_mode,
            after_hours_forward_to: config.after_hours_forward_to,
            fallback_chain: config.fallback_chain ? JSON.parse(config.fallback_chain) : [],
            fallback_timeout: config.fallback_timeout,
            voicemail_enabled: Boolean(config.voicemail_enabled),
            voicemail_greeting: config.voicemail_greeting,
            missed_call_sms: Boolean(config.missed_call_sms),
            missed_call_email: Boolean(config.missed_call_email)
        };

        return c.json(exportConfig);
    } catch (error) {
        console.error('Export config error:', error);
        return c.json({ error: 'Failed to export configuration: ' + error.message }, 500);
    }
});

// Import configuration from JSON
routing.post('/import', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const importConfig = await c.req.json();

        // Validate and prepare config
        const config = {
            routing_mode: importConfig.routing_mode || 'simultaneous',
            ring_all_devices: importConfig.ring_all_devices ? 1 : 0,
            ring_timeout: importConfig.ring_timeout || 30,
            ai_enabled: importConfig.ai_enabled ? 1 : 0,
            ai_provider: importConfig.ai_provider,
            ai_greeting: importConfig.ai_greeting,
            ai_can_transfer: importConfig.ai_can_transfer ? 1 : 0,
            ai_take_messages: importConfig.ai_take_messages ? 1 : 0,
            business_hours_enabled: importConfig.business_hours_enabled ? 1 : 0,
            business_hours_json: importConfig.business_hours ? JSON.stringify(importConfig.business_hours) : null,
            timezone: importConfig.timezone || 'America/New_York',
            after_hours_mode: importConfig.after_hours_mode || 'voicemail',
            after_hours_forward_to: importConfig.after_hours_forward_to,
            fallback_chain: importConfig.fallback_chain ? JSON.stringify(importConfig.fallback_chain) : null,
            fallback_timeout: importConfig.fallback_timeout || 30,
            voicemail_enabled: importConfig.voicemail_enabled ? 1 : 0,
            voicemail_greeting: importConfig.voicemail_greeting,
            missed_call_sms: importConfig.missed_call_sms ? 1 : 0,
            missed_call_email: importConfig.missed_call_email ? 1 : 0,
            updated_at: Math.floor(Date.now() / 1000)
        };

        await db.prepare(`
            UPDATE call_routing_config 
            SET routing_mode = ?, ring_all_devices = ?, ring_timeout = ?,
                ai_enabled = ?, ai_provider = ?, ai_greeting = ?,
                ai_can_transfer = ?, ai_take_messages = ?,
                business_hours_enabled = ?, business_hours_json = ?, timezone = ?,
                after_hours_mode = ?, after_hours_forward_to = ?,
                fallback_chain = ?, fallback_timeout = ?,
                voicemail_enabled = ?, voicemail_greeting = ?,
                missed_call_sms = ?, missed_call_email = ?, updated_at = ?
            WHERE user_id = ?
        `).bind(...Object.values(config), user.id).run();

        return c.json({
            success: true,
            message: 'Configuration imported successfully'
        });
    } catch (error) {
        console.error('Import config error:', error);
        return c.json({ error: 'Failed to import configuration: ' + error.message }, 500);
    }
});

export default routing;
