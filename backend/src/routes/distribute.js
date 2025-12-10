import { Hono } from 'hono';
import { createDistributor } from '../utils/callDistributor.js';

const distribute = new Hono();

// Test distribution algorithm
distribute.post('/test', async (c) => {
    try {
        const db = c.env.DB;
        const { teamId, requiredSkills } = await c.req.json();

        const distributor = createDistributor(db);
        const agent = await distributor.findAgent(teamId, { requiredSkills });

        if (!agent) {
            return c.json({
                success: false,
                message: 'No available agents'
            });
        }

        if (agent.type === 'simultaneous') {
            return c.json({
                success: true,
                strategy: 'simultaneous',
                agents: agent.agents.map(a => ({
                    id: a.user_id,
                    name: a.name || a.email,
                    priority: a.priority
                }))
            });
        }

        return c.json({
            success: true,
            agent: {
                id: agent.user_id,
                name: agent.name || agent.email,
                email: agent.email,
                priority: agent.priority,
                lastCall: agent.last_call_at
            }
        });
    } catch (error) {
        console.error('Test distribution error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// Simulate incoming call routing
distribute.post('/route', async (c) => {
    try {
        const db = c.env.DB;
        const { teamId, callerNumber, callSid, requiredSkills } = await c.req.json();

        const distributor = createDistributor(db);

        // Try to find available agent
        const agent = await distributor.findAgent(teamId, { requiredSkills });

        if (!agent) {
            // No agents available, add to queue
            const queueInfo = await distributor.addToQueue(teamId, callSid, callerNumber);

            return c.json({
                success: true,
                action: 'queued',
                queuePosition: queueInfo.position,
                estimatedWait: queueInfo.estimatedWait,
                queueId: queueInfo.queueId
            });
        }

        if (agent.type === 'simultaneous') {
            return c.json({
                success: true,
                action: 'ring_all',
                agents: agent.agents.map(a => a.user_id)
            });
        }

        // Assign to specific agent
        return c.json({
            success: true,
            action: 'ring_agent',
            agentId: agent.user_id,
            agentName: agent.name || agent.email
        });
    } catch (error) {
        console.error('Route call error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// Get queue stats
distribute.get('/queue/stats/:teamId', async (c) => {
    try {
        const db = c.env.DB;
        const { teamId } = c.req.param();

        const distributor = createDistributor(db);

        // Get queue depth
        const queueResult = await db.prepare(
            'SELECT COUNT(*) as count FROM call_queue WHERE team_id = ? AND status = ?'
        ).bind(teamId, 'waiting').first();

        // Get available agents
        const agents = await distributor.getAvailableAgents(teamId);

        // Get estimated wait time
        const estimatedWait = await distributor.estimateWaitTime(teamId);

        return c.json({
            success: true,
            stats: {
                queueDepth: queueResult?.count || 0,
                availableAgents: agents.length,
                estimatedWait: estimatedWait
            }
        });
    } catch (error) {
        console.error('Get queue stats error:', error);
        return c.json({ error: error.message }, 500);
    }
});

export default distribute;
