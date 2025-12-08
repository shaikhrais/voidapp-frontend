// TwiML Generator Module
// Generates TwiML responses for different call scenarios

export class TwiMLGenerator {
    constructor(env) {
        this.baseUrl = env.API_BASE_URL || 'https://voipapp.shaikhrais.workers.dev';
    }

    /**
     * Generate TwiML for outbound call
     */
    generateOutboundCall(to, from, options = {}) {
        const {
            record = false,
            recordingCallback = null,
            statusCallback = null
        } = options;

        let dialAttributes = `callerId="${from}"`;

        if (record) {
            dialAttributes += ` record="record-from-answer"`;
            if (recordingCallback) {
                dialAttributes += ` recordingStatusCallback="${recordingCallback}"`;
                dialAttributes += ` recordingStatusCallbackMethod="POST"`;
                dialAttributes += ` recordingStatusCallbackEvent="completed"`;
            }
        }

        if (statusCallback) {
            dialAttributes += ` action="${statusCallback}"`;
        }

        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial ${dialAttributes}>
        <Number>${to}</Number>
    </Dial>
</Response>`;
    }

    /**
     * Generate TwiML for voicemail
     */
    generateVoicemail(greetingText, recordingUrl = null) {
        const greeting = recordingUrl
            ? `<Play>${recordingUrl}</Play>`
            : `<Say>${greetingText}</Say>`;

        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    ${greeting}
    <Record 
        maxLength="300"
        transcribe="true"
        transcribeCallback="${this.baseUrl}/api/voice/voicemail-transcription"
        action="${this.baseUrl}/api/voice/voicemail-complete"
    />
</Response>`;
    }

    /**
     * Generate TwiML for IVR menu
     */
    generateIVRMenu(menuText, menuOptions, timeout = 5) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather 
        numDigits="1" 
        action="${this.baseUrl}/api/voice/ivr-handle" 
        timeout="${timeout}"
    >
        <Say>${menuText}</Say>
    </Gather>
    <Say>We didn't receive any input. Goodbye!</Say>
    <Hangup/>
</Response>`;
    }

    /**
     * Generate TwiML for call forwarding
     */
    generateCallForward(destinations, ringStrategy = 'simultaneous') {
        let dialContent = '';

        if (ringStrategy === 'simultaneous') {
            // Ring all numbers at once
            dialContent = destinations.map(dest => `<Number>${dest}</Number>`).join('\n        ');
        } else {
            // Sequential - will need multiple Dial verbs
            // For now, just use first destination
            dialContent = `<Number>${destinations[0]}</Number>`;
        }

        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial timeout="30">
        ${dialContent}
    </Dial>
    <Say>The call could not be completed. Please try again later.</Say>
</Response>`;
    }

    /**
     * Generate error TwiML
     */
    generateError(message = 'Sorry, there was an error placing your call.') {
        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>${message}</Say>
    <Hangup/>
</Response>`;
    }

    /**
     * Generate TwiML for call queue
     */
    generateCallQueue(queueName, waitUrl = null) {
        const waitMusic = waitUrl
            ? `waitUrl="${waitUrl}"`
            : '';

        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Enqueue ${waitMusic}>${queueName}</Enqueue>
</Response>`;
    }
}

export function createTwiMLGenerator(env) {
    return new TwiMLGenerator(env);
}
