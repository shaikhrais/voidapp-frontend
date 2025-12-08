// Call Handler Module
// Handles call initiation and management

export class CallHandler {
    constructor(db, twilioClient) {
        this.db = db;
        this.twilioClient = twilioClient;
    }

    /**
     * Initiate outbound call
     */
    async initiateCall(userId, to, from) {
        console.log(`📞 Initiating call from ${from} to ${to} for user ${userId}`);

        // Validate user and organization
        const user = await this.db.prepare(
            'SELECT id, organization_id FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!user) {
            throw new Error('User not found');
        }

        // Verify phone number belongs to organization
        const phoneNumber = await this.db.prepare(
            'SELECT id FROM phone_numbers WHERE phone_number = ? AND organization_id = ?'
        ).bind(from, user.organization_id).first();

        if (!phoneNumber) {
            throw new Error('Phone number not found or does not belong to your organization');
        }

        return {
            success: true,
            message: 'Call initiated',
            to,
            from,
            userId: user.id,
            organizationId: user.organization_id
        };
    }

    /**
     * Update call status
     */
    async updateCallStatus(callSid, status, duration = 0) {
        const now = Math.floor(Date.now() / 1000);

        await this.db.prepare(`
            UPDATE calls 
            SET status = ?, duration = ?, updated_at = ?
            WHERE sid = ?
        `).bind(status, duration, now, callSid).run();

        console.log(`✅ Updated call ${callSid} status to ${status}`);

        return { success: true };
    }

    /**
     * Get call details
     */
    async getCallDetails(callSid) {
        const call = await this.db.prepare(
            'SELECT * FROM calls WHERE sid = ?'
        ).bind(callSid).first();

        return call;
    }

    /**
     * Get active calls for organization
     */
    async getActiveCalls(organizationId) {
        const result = await this.db.prepare(`
            SELECT * FROM calls 
            WHERE organization_id = ? 
            AND status IN ('initiated', 'ringing', 'in-progress')
            ORDER BY created_at DESC
        `).bind(organizationId).all();

        return result.results || [];
    }
}

export function createCallHandler(db, twilioClient) {
    return new CallHandler(db, twilioClient);
}
