// Twilio API integration for Cloudflare Workers
// Uses native fetch API (no Twilio SDK needed)

export class TwilioClient {
    constructor(accountSid, authToken) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
    }

    // Create Basic Auth header
    getAuthHeader() {
        const credentials = btoa(`${this.accountSid}:${this.authToken}`);
        return `Basic ${credentials}`;
    }

    // Fetch call logs from Twilio
    async getCalls(params = {}) {
        const queryParams = new URLSearchParams({
            PageSize: params.pageSize || '100',
            ...(params.from && { From: params.from }),
            ...(params.to && { To: params.to }),
            ...(params.startTime && { 'StartTime>': params.startTime }),
        });

        const response = await fetch(`${this.baseUrl}/Calls.json?${queryParams}`, {
            headers: {
                'Authorization': this.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error(`Twilio API error: ${response.status}`);
        }

        return await response.json();
    }

    // Fetch SMS messages from Twilio
    async getMessages(params = {}) {
        const queryParams = new URLSearchParams({
            PageSize: params.pageSize || '100',
            ...(params.from && { From: params.from }),
            ...(params.to && { To: params.to }),
            ...(params.dateSent && { 'DateSent>': params.dateSent }),
        });

        const response = await fetch(`${this.baseUrl}/Messages.json?${queryParams}`, {
            headers: {
                'Authorization': this.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error(`Twilio API error: ${response.status}`);
        }

        return await response.json();
    }

    // Make an outbound call
    async makeCall(from, to, url) {
        const formData = new URLSearchParams({
            From: from,
            To: to,
            Url: url,
        });

        const response = await fetch(`${this.baseUrl}/Calls.json`, {
            method: 'POST',
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Twilio API error: ${response.status}`);
        }

        return await response.json();
    }

    // Send an SMS
    async sendMessage(from, to, body) {
        const formData = new URLSearchParams({
            From: from,
            To: to,
            Body: body,
        });

        const response = await fetch(`${this.baseUrl}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Twilio API error: ${response.status}`);
        }

        return await response.json();
    }

    // Get phone numbers
    async getPhoneNumbers() {
        const response = await fetch(`${this.baseUrl}/IncomingPhoneNumbers.json`, {
            headers: {
                'Authorization': this.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error(`Twilio API error: ${response.status}`);
        }

        return await response.json();
    }
}

export function createTwilioClient(env) {
    return new TwilioClient(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}
