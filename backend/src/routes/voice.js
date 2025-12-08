import { Hono } from 'hono';
import { jwtVerify } from 'jose';

const voice = new Hono();

// Auth middleware (skip for TwiML endpoints)
voice.use('*', async (c, next) => {
    // Skip auth for TwiML and status callbacks
    if (c.req.path.includes('/twiml') || c.req.path.includes('/status')) {
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

// Generate Twilio access token for Voice SDK
voice.get('/token', async (c) => {
    try {
        const user = c.get('user');
        const accountSid = c.env.TWILIO_ACCOUNT_SID;
        const apiKey = c.env.TWILIO_API_KEY;
        const apiSecret = c.env.TWILIO_API_SECRET;
        const twimlAppSid = c.env.TWILIO_TWIML_APP_SID;

        console.log('Generating token for user:', user.email);
        console.log('Account SID:', accountSid);
        console.log('API Key:', apiKey);
        console.log('TwiML App SID:', twimlAppSid);

        if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
            console.error('Missing Twilio credentials');
            return c.json({ error: 'Server configuration error' }, 500);
        }

        // Create JWT token for Twilio Voice
        const now = Math.floor(Date.now() / 1000);
        const exp = now + 3600; // 1 hour

        const header = {
            cty: 'twilio-fpa;v=1',
            typ: 'JWT',
            alg: 'HS256'
        };

        const payload = {
            jti: `${apiKey}-${now}`,
            iss: apiKey,
            sub: accountSid,
            exp: exp,
            grants: {
                identity: user.email,
                voice: {
                    outgoing: {
                        application_sid: twimlAppSid
                    },
                    incoming: {
                        allow: true
                    }
                }
            }
        };

        // Encode header and payload
        const encoder = new TextEncoder();
        const headerB64 = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(header))))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        const payloadB64 = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(payload))))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        // Create signature
        const message = `${headerB64}.${payloadB64}`;
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(apiSecret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
        const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        const twilioToken = `${message}.${signatureB64}`;

        console.log('Token generated successfully');

        return c.json({
            token: twilioToken,
            identity: user.email
        });
    } catch (error) {
        console.error('Token generation error:', error);
        console.error('Error stack:', error.stack);
        return c.json({ error: 'Failed to generate token: ' + error.message }, 500);
    }
});

// Make outbound call
voice.post('/call', async (c) => {
    try {
        const user = c.get('user');
        const { to, from } = await c.req.json();

        if (!to || !from) {
            return c.json({ error: 'Missing required fields: to, from' }, 400);
        }

        // This will be handled by TwiML app
        return c.json({
            success: true,
            message: 'Call initiated',
            to,
            from
        });
    } catch (error) {
        console.error('Call error:', error);
        return c.json({ error: 'Failed to initiate call' }, 500);
    }
});

// TwiML endpoint for handling calls
voice.post('/twiml', async (c) => {
    try {
        console.log('TwiML endpoint called');
        console.log('Headers:', c.req.header());

        const body = await c.req.parseBody();
        console.log('Request body:', body);

        const To = body.To || body.to;
        const From = body.From || body.from; // Get the selected number from frontend
        console.log('Calling to:', To, 'from:', From);

        if (!To) {
            console.error('No To parameter received');
            const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Sorry, there was an error placing your call.</Say>
</Response>`;
            return c.text(errorTwiml, 200, {
                'Content-Type': 'text/xml'
            });
        }

        // Use the From parameter as callerId, or fallback to default
        const callerId = From || '+16479302223';

        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial callerId="${callerId}">
        <Number>${To}</Number>
    </Dial>
</Response>`;

        console.log('Returning TwiML:', twiml);
        return c.text(twiml, 200, {
            'Content-Type': 'text/xml'
        });
    } catch (error) {
        console.error('TwiML error:', error);
        const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Sorry, there was an error placing your call.</Say>
</Response>`;
        return c.text(errorTwiml, 200, {
            'Content-Type': 'text/xml'
        });
    }
});

// Call status callback
voice.post('/status', async (c) => {
    try {
        const body = await c.req.parseBody();
        console.log('Call status:', body);

        const callSid = body.CallSid;
        const callStatus = body.CallStatus;
        const callDuration = body.CallDuration;

        if (callSid) {
            const db = c.env.DB;
            await db.prepare(`
                UPDATE calls 
                SET status = ?, duration = ?, updated_at = ?
                WHERE sid = ?
            `).bind(
                callStatus,
                callDuration || 0,
                Math.floor(Date.now() / 1000),
                callSid
            ).run();
            console.log('Updated call status in database:', callSid, callStatus);
        }

        return c.text('OK');
    } catch (error) {
        console.error('Status callback error:', error);
        return c.text('Error', 500);
    }
});

export default voice;
