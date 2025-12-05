// const app = require('./server'); // Express is not fully compatible with Workers yet

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Simple router
        if (request.method === 'POST' && url.pathname === '/webhooks/voice') {
            return handleVoiceWebhook(request);
        }

        if (url.pathname === '/') {
            return new Response("VOIP App on Cloudflare Workers (Limited Functionality)", {
                headers: { 'content-type': 'text/plain' }
            });
        }

        return new Response("Not Found", { status: 404 });
    }
};

async function handleVoiceWebhook(request) {
    // Generate TwiML manually to avoid dependencies
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">Welcome to our VOIP service. Please hold while we connect you to an agent.</Say>
  <Play>http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3</Play>
</Response>`;

    return new Response(twiml, {
        headers: {
            'Content-Type': 'text/xml'
        }
    });
}
