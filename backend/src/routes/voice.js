// Voice Routes - Refactored Modular Structure
// Main router that delegates to feature modules

import { Hono } from 'hono';
import { jwtVerify } from 'jose';
import { createTokenGenerator } from '../modules/voice/tokenGenerator.js';
import { createTwiMLGenerator } from '../modules/voice/twimlGenerator.js';
import { createCallHandler } from '../modules/voice/callHandler.js';

const voice = new Hono();

// Auth middleware (skip for TwiML and callback endpoints)
voice.use('*', async (c, next) => {
    // Skip auth for Twilio callbacks
    const publicPaths = ['/twiml', '/status', '/recording-status', '/voicemail', '/ivr'];
    const isPublicPath = publicPaths.some(path => c.req.path.includes(path));

    if (isPublicPath) {
        return await next();
    }

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
            'SELECT id, email, organization_id FROM users WHERE id = ?'
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

// ============================================
// TOKEN GENERATION
// ============================================

voice.get('/token', async (c) => {
    try {
        const user = c.get('user');
        const tokenGenerator = createTokenGenerator(c.env);
        const result = await tokenGenerator.generateToken(user.email);

        return c.json(result);
    } catch (error) {
        console.error('Token generation error:', error);
        return c.json({ error: 'Failed to generate token: ' + error.message }, 500);
    }
});

// ============================================
// CALL INITIATION
// ============================================

voice.post('/call', async (c) => {
    try {
        const user = c.get('user');
        const { to, from } = await c.req.json();

        if (!to || !from) {
            return c.json({ error: 'Missing required fields: to, from' }, 400);
        }

        const callHandler = createCallHandler(c.env.DB, null);
        const result = await callHandler.initiateCall(user.id, to, from);

        return c.json(result);
    } catch (error) {
        console.error('Call error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// ============================================
// TWIML GENERATION
// ============================================

voice.post('/twiml', async (c) => {
    try {
        console.log('=== TWIML ENDPOINT ===');

        const body = await c.req.parseBody();
        const To = body.To || body.to;
        const From = body.From || body.from;

        console.log('📞 To:', To, 'From:', From);

        if (!To) {
            const twimlGen = createTwiMLGenerator(c.env);
            return c.text(twimlGen.generateError(), 200, {
                'Content-Type': 'text/xml'
            });
        }

        if (!From) {
            console.error('⚠️ WARNING: No From parameter received!');
        }

        const twimlGen = createTwiMLGenerator(c.env);
        const twiml = twimlGen.generateOutboundCall(To, From, {
            record: true,
            recordingCallback: `${c.env.API_BASE_URL || 'https://voipapp.shaikhrais.workers.dev'}/api/voice/recording-status`,
            statusCallback: `${c.env.API_BASE_URL || 'https://voipapp.shaikhrais.workers.dev'}/api/voice/status`
        });

        console.log('📄 Generated TwiML');

        return c.text(twiml, 200, {
            'Content-Type': 'text/xml'
        });
    } catch (error) {
        console.error('TwiML error:', error);
        const twimlGen = createTwiMLGenerator(c.env);
        return c.text(twimlGen.generateError(), 200, {
            'Content-Type': 'text/xml'
        });
    }
});

// ============================================
// CALL STATUS CALLBACK
// ============================================

voice.post('/status', async (c) => {
    try {
        const body = await c.req.parseBody();
        console.log('📊 Call status:', body.CallStatus);

        const callSid = body.CallSid;
        const callStatus = body.CallStatus;
        const callDuration = body.CallDuration;

        if (callSid) {
            const callHandler = createCallHandler(c.env.DB, null);
            await callHandler.updateCallStatus(callSid, callStatus, callDuration || 0);
        }

        return c.text('OK');
    } catch (error) {
        console.error('Status callback error:', error);
        return c.text('Error', 500);
    }
});

// ============================================
// RECORDING STATUS CALLBACK
// ============================================

voice.post('/recording-status', async (c) => {
    try {
        const body = await c.req.parseBody();
        console.log('🎙️ Recording status:', body.RecordingStatus);

        const recordingSid = body.RecordingSid;
        const recordingUrl = body.RecordingUrl;
        const recordingDuration = body.RecordingDuration;
        const callSid = body.CallSid;

        if (recordingSid && callSid) {
            // Store recording metadata
            // This will be handled by CallRecordingManager in the future
            console.log(`✅ Recording ${recordingSid} for call ${callSid}`);
        }

        return c.text('OK');
    } catch (error) {
        console.error('Recording callback error:', error);
        return c.text('Error', 500);
    }
});

export default voice;
