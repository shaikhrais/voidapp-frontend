// Twilio Usage Tracking Helper for Multi-Tenant SaaS
// Tracks usage, calculates costs, and manages organization credits

export class TwilioUsageTracker {
    constructor(db, twilioClient) {
        this.db = db;
        this.twilioClient = twilioClient;
    }

    /**
     * Track call cost and update organization credits
     * @param {string} callSid - Twilio Call SID
     * @param {string} organizationId - Organization ID
     * @returns {Object} Cost and remaining credits
     */
    async trackCallCost(callSid, organizationId) {
        try {
            // Get call details from Twilio
            const call = await this.twilioClient.calls(callSid).fetch();

            // Get organization pricing
            const org = await this.db.prepare(
                'SELECT call_rate_per_minute, credits FROM organizations_v2 WHERE id = ?'
            ).bind(organizationId).first();

            if (!org) {
                throw new Error(`Organization ${organizationId} not found`);
            }

            // Calculate cost (round up to nearest minute)
            const durationMinutes = Math.ceil(call.duration / 60);
            const cost = durationMinutes * (org.call_rate_per_minute || 0.02); // Default $0.02/min

            console.log(`📊 Call ${callSid}: ${durationMinutes} min × $${org.call_rate_per_minute}/min = $${cost}`);

            // Check if organization has enough credits
            if (org.credits < cost) {
                console.warn(`⚠️ Organization ${organizationId} has insufficient credits: ${org.credits} < ${cost}`);
            }

            // Deduct from credits
            const newBalance = org.credits - cost;
            await this.db.prepare(
                'UPDATE organizations_v2 SET credits = ? WHERE id = ?'
            ).bind(newBalance, organizationId).run();

            // Log transaction
            const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            await this.db.prepare(`
                INSERT INTO transactions (
                    id, organization_id, type, amount, description,
                    balance_before, balance_after, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                transactionId,
                organizationId,
                'debit',
                cost,
                `Call to ${call.to} (${durationMinutes} min)`,
                org.credits,
                newBalance,
                Math.floor(Date.now() / 1000)
            ).run();

            console.log(`✅ Transaction ${transactionId} created: $${cost} deducted, new balance: $${newBalance}`);

            return {
                cost,
                remainingCredits: newBalance,
                duration: call.duration,
                status: call.status
            };
        } catch (error) {
            console.error(`❌ Error tracking call cost for ${callSid}:`, error);
            throw error;
        }
    }

    /**
     * Track SMS cost and update organization credits
     * @param {string} messageSid - Twilio Message SID
     * @param {string} organizationId - Organization ID
     * @returns {Object} Cost and remaining credits
     */
    async trackSMSCost(messageSid, organizationId) {
        try {
            // Get message details from Twilio
            const message = await this.twilioClient.messages(messageSid).fetch();

            // Get organization pricing
            const org = await this.db.prepare(
                'SELECT sms_rate, credits FROM organizations_v2 WHERE id = ?'
            ).bind(organizationId).first();

            if (!org) {
                throw new Error(`Organization ${organizationId} not found`);
            }

            // Calculate cost
            const cost = org.sms_rate || 0.01; // Default $0.01 per SMS

            console.log(`📊 SMS ${messageSid}: $${cost}`);

            // Deduct from credits
            const newBalance = org.credits - cost;
            await this.db.prepare(
                'UPDATE organizations_v2 SET credits = ? WHERE id = ?'
            ).bind(newBalance, organizationId).run();

            // Log transaction
            const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            await this.db.prepare(`
                INSERT INTO transactions (
                    id, organization_id, type, amount, description,
                    balance_before, balance_after, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                transactionId,
                organizationId,
                'debit',
                cost,
                `SMS to ${message.to}`,
                org.credits,
                newBalance,
                Math.floor(Date.now() / 1000)
            ).run();

            return {
                cost,
                remainingCredits: newBalance,
                status: message.status
            };
        } catch (error) {
            console.error(`❌ Error tracking SMS cost for ${messageSid}:`, error);
            throw error;
        }
    }

    /**
     * Get usage summary for organization
     * @param {string} organizationId - Organization ID
     * @param {number} startDate - Unix timestamp
     * @param {number} endDate - Unix timestamp
     * @returns {Object} Usage statistics
     */
    async getOrganizationUsage(organizationId, startDate, endDate) {
        try {
            console.log(`📊 Fetching usage for org ${organizationId} from ${startDate} to ${endDate}`);

            // Get call statistics
            const calls = await this.db.prepare(`
                SELECT 
                    COUNT(*) as total_calls,
                    SUM(duration) as total_duration,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_calls,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_calls,
                    COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as inbound_calls,
                    COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as outbound_calls
                FROM calls
                WHERE organization_id = ?
                AND created_at BETWEEN ? AND ?
            `).bind(organizationId, startDate, endDate).first();

            // Get message statistics
            const messages = await this.db.prepare(`
                SELECT 
                    COUNT(*) as total_messages,
                    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_messages,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_messages,
                    COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as inbound_messages,
                    COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as outbound_messages
                FROM messages
                WHERE organization_id = ?
                AND created_at BETWEEN ? AND ?
            `).bind(organizationId, startDate, endDate).first();

            // Get transaction summary (costs)
            const transactions = await this.db.prepare(`
                SELECT 
                    SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_spent,
                    SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credited,
                    COUNT(*) as total_transactions
                FROM transactions
                WHERE organization_id = ?
                AND created_at BETWEEN ? AND ?
            `).bind(organizationId, startDate, endDate).first();

            // Calculate success rates
            const callSuccessRate = calls.total_calls > 0
                ? (calls.successful_calls / calls.total_calls * 100).toFixed(2)
                : 0;

            const smsSuccessRate = messages.total_messages > 0
                ? (messages.delivered_messages / messages.total_messages * 100).toFixed(2)
                : 0;

            return {
                period: {
                    start: new Date(startDate * 1000).toISOString(),
                    end: new Date(endDate * 1000).toISOString()
                },
                calls: {
                    total: calls.total_calls || 0,
                    successful: calls.successful_calls || 0,
                    failed: calls.failed_calls || 0,
                    inbound: calls.inbound_calls || 0,
                    outbound: calls.outbound_calls || 0,
                    totalDuration: calls.total_duration || 0,
                    totalDurationMinutes: Math.ceil((calls.total_duration || 0) / 60),
                    successRate: parseFloat(callSuccessRate)
                },
                messages: {
                    total: messages.total_messages || 0,
                    delivered: messages.delivered_messages || 0,
                    failed: messages.failed_messages || 0,
                    inbound: messages.inbound_messages || 0,
                    outbound: messages.outbound_messages || 0,
                    successRate: parseFloat(smsSuccessRate)
                },
                costs: {
                    totalSpent: transactions.total_spent || 0,
                    totalCredited: transactions.total_credited || 0,
                    netCost: (transactions.total_spent || 0) - (transactions.total_credited || 0),
                    transactionCount: transactions.total_transactions || 0
                }
            };
        } catch (error) {
            console.error(`❌ Error fetching usage for org ${organizationId}:`, error);
            throw error;
        }
    }

    /**
     * Get top users by usage within organization
     * @param {string} organizationId - Organization ID
     * @param {number} startDate - Unix timestamp
     * @param {number} endDate - Unix timestamp
     * @param {number} limit - Number of users to return
     * @returns {Array} Top users by call volume
     */
    async getTopUsers(organizationId, startDate, endDate, limit = 10) {
        try {
            const result = await this.db.prepare(`
                SELECT 
                    u.id,
                    u.email,
                    COUNT(c.id) as call_count,
                    SUM(c.duration) as total_duration
                FROM calls c
                JOIN users u ON c.user_id = u.id
                WHERE c.organization_id = ?
                AND c.created_at BETWEEN ? AND ?
                GROUP BY u.id, u.email
                ORDER BY call_count DESC
                LIMIT ?
            `).bind(organizationId, startDate, endDate, limit).all();

            return result.results || [];
        } catch (error) {
            console.error(`❌ Error fetching top users:`, error);
            throw error;
        }
    }

    /**
     * Check if organization has sufficient credits
     * @param {string} organizationId - Organization ID
     * @param {number} estimatedCost - Estimated cost of operation
     * @returns {boolean} True if sufficient credits
     */
    async hasSufficientCredits(organizationId, estimatedCost) {
        const org = await this.db.prepare(
            'SELECT credits FROM organizations_v2 WHERE id = ?'
        ).bind(organizationId).first();

        if (!org) {
            throw new Error(`Organization ${organizationId} not found`);
        }

        return org.credits >= estimatedCost;
    }
}

// Export helper function to create instance
export function createUsageTracker(db, twilioClient) {
    return new TwilioUsageTracker(db, twilioClient);
}
