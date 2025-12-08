// Voice Token Generator Module
// Handles Twilio Voice SDK token generation

export class VoiceTokenGenerator {
    constructor(env) {
        this.accountSid = env.TWILIO_ACCOUNT_SID;
        this.apiKey = env.TWILIO_API_KEY;
        this.apiSecret = env.TWILIO_API_SECRET;
        this.twimlAppSid = env.TWILIO_TWIML_APP_SID;
    }

    /**
     * Generate Twilio Voice token for user
     */
    async generateToken(userEmail) {
        console.log('Generating token for user:', userEmail);

        if (!this.accountSid || !this.apiKey || !this.apiSecret || !this.twimlAppSid) {
            throw new Error('Missing Twilio credentials');
        }

        const now = Math.floor(Date.now() / 1000);
        const exp = now + 3600; // 1 hour

        const header = {
            cty: 'twilio-fpa;v=1',
            typ: 'JWT',
            alg: 'HS256'
        };

        const payload = {
            jti: `${this.apiKey}-${now}`,
            iss: this.apiKey,
            sub: this.accountSid,
            exp: exp,
            grants: {
                identity: userEmail,
                voice: {
                    outgoing: {
                        application_sid: this.twimlAppSid
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
            encoder.encode(this.apiSecret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
        const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        const twilioToken = `${message}.${signatureB64}`;

        console.log('✅ Token generated successfully');

        return {
            token: twilioToken,
            identity: userEmail
        };
    }
}

export function createTokenGenerator(env) {
    return new VoiceTokenGenerator(env);
}
