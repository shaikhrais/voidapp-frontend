// Call Distribution Engine
// Handles routing incoming calls to agents based on team strategy

export class CallDistributor {
    constructor(db) {
        this.db = db;
    }

    /**
     * Find best agent for incoming call
     * @param {string} teamId - Team to route call to
     * @param {object} callData - Call information
     * @returns {object} Selected agent or null
     */
    async findAgent(teamId, callData = {}) {
        // Get team configuration
        const team = await this.db.prepare(
            'SELECT * FROM teams WHERE id = ?'
        ).bind(teamId).first();

        if (!team) {
            throw new Error('Team not found');
        }

        // Get available team members
        const availableAgents = await this.getAvailableAgents(teamId);

        if (availableAgents.length === 0) {
            return null; // No agents available
        }

        // Route based on strategy
        switch (team.distribution_strategy) {
            case 'round_robin':
                return this.roundRobin(availableAgents, teamId);

            case 'longest_idle':
                return this.longestIdle(availableAgents);

            case 'simultaneous':
                return this.simultaneousRing(availableAgents);

            case 'skills_based':
                return this.skillsBased(availableAgents, callData.requiredSkills || []);

            default:
                return this.roundRobin(availableAgents, teamId);
        }
    }

    /**
     * Get available agents for a team
     */
    async getAvailableAgents(teamId) {
        const result = await this.db.prepare(`
            SELECT tm.*, as.status, as.last_call_at, u.email, u.name
            FROM team_members tm
            JOIN users u ON tm.user_id = u.id
            LEFT JOIN agent_status as ON tm.user_id = as.user_id
            WHERE tm.team_id = ? 
            AND (as.status = 'available' OR as.status IS NULL)
            ORDER BY tm.priority ASC
        `).bind(teamId).all();

        return result.results || [];
    }

    /**
     * Round Robin: Rotate through agents
     * Uses a simple counter stored in team metadata
     */
    async roundRobin(agents, teamId) {
        if (agents.length === 0) return null;

        // Get last assigned index (stored in memory or cache)
        // For simplicity, we'll use modulo based on current time
        const index = Math.floor(Date.now() / 1000) % agents.length;

        return agents[index];
    }

    /**
     * Longest Idle: Agent who hasn't taken a call in longest time
     */
    longestIdle(agents) {
        if (agents.length === 0) return null;

        // Sort by last_call_at (oldest first, nulls first)
        const sorted = agents.sort((a, b) => {
            if (!a.last_call_at) return -1;
            if (!b.last_call_at) return 1;
            return a.last_call_at - b.last_call_at;
        });

        return sorted[0];
    }

    /**
     * Simultaneous Ring: Return all agents
     * TwiML will dial all at once, first to answer gets call
     */
    simultaneousRing(agents) {
        return {
            type: 'simultaneous',
            agents: agents
        };
    }

    /**
     * Skills-based: Match agent skills to required skills
     */
    skillsBased(agents, requiredSkills = []) {
        if (agents.length === 0) return null;
        if (requiredSkills.length === 0) {
            // No skills required, use round robin
            return agents[0];
        }

        // Filter agents by skills
        const matchedAgents = agents.filter(agent => {
            if (!agent.skills) return false;

            const agentSkills = JSON.parse(agent.skills);
            return requiredSkills.every(skill =>
                agentSkills.includes(skill)
            );
        });

        if (matchedAgents.length === 0) {
            // No perfect match, return any available agent
            return agents[0];
        }

        // Return first matched agent (could use longest idle here too)
        return matchedAgents[0];
    }

    /**
     * Add call to queue
     */
    async addToQueue(teamId, callSid, callerNumber, priority = 1) {
        const queueId = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = Math.floor(Date.now() / 1000);

        // Get current queue position
        const posResult = await this.db.prepare(
            'SELECT COUNT(*) as count FROM call_queue WHERE team_id = ? AND status = ?'
        ).bind(teamId, 'waiting').first();

        const position = (posResult?.count || 0) + 1;

        await this.db.prepare(`
            INSERT INTO call_queue (
                id, call_sid, team_id, caller_number, priority, position, entered_at, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            queueId,
            callSid,
            callerNumber,
            priority,
            position,
            now,
            'waiting'
        ).run();

        return {
            queueId,
            position,
            estimatedWait: this.estimateWaitTime(teamId)
        };
    }

    /**
     * Estimate wait time based on queue depth and average handle time
     */
    async estimateWaitTime(teamId) {
        // Get queue depth
        const queueResult = await this.db.prepare(
            'SELECT COUNT(*) as count FROM call_queue WHERE team_id = ? AND status = ?'
        ).bind(teamId, 'waiting').first();

        const queueDepth = queueResult?.count || 0;

        // Get available agents
        const agents = await this.getAvailableAgents(teamId);
        const availableCount = agents.length;

        if (availableCount === 0) {
            return queueDepth * 120; // 2 minutes per caller if no agents
        }

        // Estimate: (queue depth / available agents) * average handle time
        const avgHandleTime = 180; // 3 minutes average
        return Math.ceil((queueDepth / availableCount) * avgHandleTime);
    }

    /**
     * Get next call from queue
     */
    async getNextFromQueue(teamId) {
        const result = await this.db.prepare(`
            SELECT * FROM call_queue 
            WHERE team_id = ? AND status = 'waiting'
            ORDER BY priority DESC, entered_at ASC
            LIMIT 1
        `).bind(teamId).first();

        return result;
    }

    /**
     * Assign call to agent
     */
    async assignCall(queueId, agentId) {
        const now = Math.floor(Date.now() / 1000);

        // Get queue item to calculate wait time
        const queueItem = await this.db.prepare(
            'SELECT * FROM call_queue WHERE id = ?'
        ).bind(queueId).first();

        if (!queueItem) {
            throw new Error('Queue item not found');
        }

        const waitTime = now - queueItem.entered_at;

        // Update queue item
        await this.db.prepare(`
            UPDATE call_queue 
            SET assigned_to = ?, status = 'assigned', wait_time = ?
            WHERE id = ?
        `).bind(agentId, waitTime, queueId).run();

        // Update agent status
        await this.db.prepare(`
            UPDATE agent_status 
            SET status = 'busy', last_call_at = ?, total_calls_today = total_calls_today + 1
            WHERE user_id = ?
        `).bind(now, agentId).run();

        return {
            success: true,
            waitTime
        };
    }

    /**
     * Mark call as completed
     */
    async completeCall(queueId) {
        await this.db.prepare(`
            UPDATE call_queue 
            SET status = 'answered'
            WHERE id = ?
        `).bind(queueId).run();
    }

    /**
     * Mark call as abandoned (caller hung up)
     */
    async abandonCall(queueId) {
        await this.db.prepare(`
            UPDATE call_queue 
            SET status = 'abandoned'
            WHERE id = ?
        `).bind(queueId).run();
    }
}

// Helper function to create distributor instance
export function createDistributor(db) {
    return new CallDistributor(db);
}
