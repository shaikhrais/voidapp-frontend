import { Hono } from 'hono';
import { jwtVerify } from 'jose';

const teams = new Hono();

// Auth middleware
teams.use('*', async (c, next) => {
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
            'SELECT id, email, role, organization_id FROM users WHERE id = ?'
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
// TEAM MANAGEMENT
// ============================================

// Get all teams
teams.get('/', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        const result = await db.prepare(
            'SELECT * FROM teams WHERE organization_id = ? ORDER BY created_at DESC'
        ).bind(user.organization_id).all();

        return c.json({
            success: true,
            teams: result.results || []
        });
    } catch (error) {
        console.error('Get teams error:', error);
        return c.json({ error: 'Failed to get teams: ' + error.message }, 500);
    }
});

// Get single team
teams.get('/:id', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { id } = c.req.param();

        const team = await db.prepare(
            'SELECT * FROM teams WHERE id = ? AND organization_id = ?'
        ).bind(id, user.organization_id).first();

        if (!team) {
            return c.json({ error: 'Team not found' }, 404);
        }

        return c.json({
            success: true,
            team
        });
    } catch (error) {
        console.error('Get team error:', error);
        return c.json({ error: 'Failed to get team: ' + error.message }, 500);
    }
});

// Create team
teams.post('/', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const body = await c.req.json();

        const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = Math.floor(Date.now() / 1000);

        await db.prepare(`
            INSERT INTO teams (
                id, organization_id, name, description, distribution_strategy,
                max_queue_size, max_wait_time, overflow_action, ring_timeout,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            teamId,
            user.organization_id,
            body.name,
            body.description || null,
            body.distribution_strategy || 'round_robin',
            body.max_queue_size || 50,
            body.max_wait_time || 300,
            body.overflow_action || 'voicemail',
            body.ring_timeout || 30,
            now,
            now
        ).run();

        return c.json({
            success: true,
            teamId,
            message: 'Team created successfully'
        });
    } catch (error) {
        console.error('Create team error:', error);
        return c.json({ error: 'Failed to create team: ' + error.message }, 500);
    }
});

// Update team
teams.put('/:id', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { id } = c.req.param();
        const body = await c.req.json();

        await db.prepare(`
            UPDATE teams 
            SET name = ?, description = ?, distribution_strategy = ?,
                max_queue_size = ?, max_wait_time = ?, overflow_action = ?,
                ring_timeout = ?, updated_at = ?
            WHERE id = ? AND organization_id = ?
        `).bind(
            body.name,
            body.description,
            body.distribution_strategy,
            body.max_queue_size,
            body.max_wait_time,
            body.overflow_action,
            body.ring_timeout,
            Math.floor(Date.now() / 1000),
            id,
            user.organization_id
        ).run();

        return c.json({
            success: true,
            message: 'Team updated successfully'
        });
    } catch (error) {
        console.error('Update team error:', error);
        return c.json({ error: 'Failed to update team: ' + error.message }, 500);
    }
});

// Delete team
teams.delete('/:id', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { id } = c.req.param();

        // Delete team members first
        await db.prepare('DELETE FROM team_members WHERE team_id = ?').bind(id).run();

        // Delete team
        await db.prepare(
            'DELETE FROM teams WHERE id = ? AND organization_id = ?'
        ).bind(id, user.organization_id).run();

        return c.json({
            success: true,
            message: 'Team deleted successfully'
        });
    } catch (error) {
        console.error('Delete team error:', error);
        return c.json({ error: 'Failed to delete team: ' + error.message }, 500);
    }
});

// ============================================
// TEAM MEMBERS
// ============================================

// Get team members
teams.get('/:id/members', async (c) => {
    try {
        const db = c.env.DB;
        const { id } = c.req.param();

        const result = await db.prepare(`
            SELECT tm.*, u.email, u.name 
            FROM team_members tm
            JOIN users u ON tm.user_id = u.id
            WHERE tm.team_id = ?
            ORDER BY tm.priority ASC
        `).bind(id).all();

        return c.json({
            success: true,
            members: result.results || []
        });
    } catch (error) {
        console.error('Get members error:', error);
        return c.json({ error: 'Failed to get members: ' + error.message }, 500);
    }
});

// Add team member
teams.post('/:id/members', async (c) => {
    try {
        const db = c.env.DB;
        const { id } = c.req.param();
        const body = await c.req.json();

        const memberId = `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await db.prepare(`
            INSERT INTO team_members (
                id, team_id, user_id, role, priority, skills, max_concurrent_calls, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            memberId,
            id,
            body.user_id,
            body.role || 'agent',
            body.priority || 1,
            body.skills ? JSON.stringify(body.skills) : null,
            body.max_concurrent_calls || 1,
            Math.floor(Date.now() / 1000)
        ).run();

        return c.json({
            success: true,
            memberId,
            message: 'Member added successfully'
        });
    } catch (error) {
        console.error('Add member error:', error);
        return c.json({ error: 'Failed to add member: ' + error.message }, 500);
    }
});

// Remove team member
teams.delete('/:id/members/:userId', async (c) => {
    try {
        const db = c.env.DB;
        const { id, userId } = c.req.param();

        await db.prepare(
            'DELETE FROM team_members WHERE team_id = ? AND user_id = ?'
        ).bind(id, userId).run();

        return c.json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        console.error('Remove member error:', error);
        return c.json({ error: 'Failed to remove member: ' + error.message }, 500);
    }
});

// ============================================
// AGENT STATUS
// ============================================

// Get all agent statuses
teams.get('/agents/status', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        const result = await db.prepare(`
            SELECT as.*, u.email, u.name 
            FROM agent_status as
            JOIN users u ON as.user_id = u.id
            WHERE u.organization_id = ?
            ORDER BY as.status ASC
        `).bind(user.organization_id).all();

        return c.json({
            success: true,
            agents: result.results || []
        });
    } catch (error) {
        console.error('Get agent status error:', error);
        return c.json({ error: 'Failed to get agent status: ' + error.message }, 500);
    }
});

// Update my status
teams.put('/agents/status', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const body = await c.req.json();

        // Check if status exists
        const existing = await db.prepare(
            'SELECT id FROM agent_status WHERE user_id = ?'
        ).bind(user.id).first();

        if (existing) {
            // Update
            await db.prepare(`
                UPDATE agent_status 
                SET status = ?, status_message = ?, updated_at = ?
                WHERE user_id = ?
            `).bind(
                body.status,
                body.status_message || null,
                Math.floor(Date.now() / 1000),
                user.id
            ).run();
        } else {
            // Insert
            const statusId = `status-${user.id}`;
            await db.prepare(`
                INSERT INTO agent_status (
                    id, user_id, status, status_message, updated_at
                ) VALUES (?, ?, ?, ?, ?)
            `).bind(
                statusId,
                user.id,
                body.status,
                body.status_message || null,
                Math.floor(Date.now() / 1000)
            ).run();
        }

        return c.json({
            success: true,
            message: 'Status updated successfully'
        });
    } catch (error) {
        console.error('Update status error:', error);
        return c.json({ error: 'Failed to update status: ' + error.message }, 500);
    }
});

// Get available agents
teams.get('/agents/available', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        const result = await db.prepare(`
            SELECT as.*, u.email, u.name 
            FROM agent_status as
            JOIN users u ON as.user_id = u.id
            WHERE u.organization_id = ? AND as.status = 'available'
            ORDER BY as.last_call_at ASC NULLS FIRST
        `).bind(user.organization_id).all();

        return c.json({
            success: true,
            agents: result.results || []
        });
    } catch (error) {
        console.error('Get available agents error:', error);
        return c.json({ error: 'Failed to get available agents: ' + error.message }, 500);
    }
});

// ============================================
// CALL QUEUE
// ============================================

// Get current queue
teams.get('/queue', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        const result = await db.prepare(`
            SELECT cq.*, t.name as team_name
            FROM call_queue cq
            LEFT JOIN teams t ON cq.team_id = t.id
            WHERE t.organization_id = ? AND cq.status = 'waiting'
            ORDER BY cq.priority DESC, cq.entered_at ASC
        `).bind(user.organization_id).all();

        return c.json({
            success: true,
            queue: result.results || []
        });
    } catch (error) {
        console.error('Get queue error:', error);
        return c.json({ error: 'Failed to get queue: ' + error.message }, 500);
    }
});

// Add call to queue
teams.post('/queue', async (c) => {
    try {
        const db = c.env.DB;
        const body = await c.req.json();

        const queueId = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = Math.floor(Date.now() / 1000);

        // Get current queue position
        const posResult = await db.prepare(
            'SELECT COUNT(*) as count FROM call_queue WHERE team_id = ? AND status = ?'
        ).bind(body.team_id, 'waiting').first();

        const position = (posResult?.count || 0) + 1;

        await db.prepare(`
            INSERT INTO call_queue (
                id, call_sid, team_id, caller_number, priority, position, entered_at, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            queueId,
            body.call_sid,
            body.team_id,
            body.caller_number,
            body.priority || 1,
            position,
            now,
            'waiting'
        ).run();

        return c.json({
            success: true,
            queueId,
            position
        });
    } catch (error) {
        console.error('Add to queue error:', error);
        return c.json({ error: 'Failed to add to queue: ' + error.message }, 500);
    }
});

// Assign call to agent
teams.post('/queue/assign', async (c) => {
    try {
        const db = c.env.DB;
        const body = await c.req.json();

        await db.prepare(`
            UPDATE call_queue 
            SET assigned_to = ?, status = 'assigned', wait_time = ?
            WHERE id = ?
        `).bind(
            body.agent_id,
            Math.floor(Date.now() / 1000) - body.entered_at,
            body.queue_id
        ).run();

        return c.json({
            success: true,
            message: 'Call assigned successfully'
        });
    } catch (error) {
        console.error('Assign call error:', error);
        return c.json({ error: 'Failed to assign call: ' + error.message }, 500);
    }
});

// Update queue item status
teams.put('/queue/:id/status', async (c) => {
    try {
        const db = c.env.DB;
        const { id } = c.req.param();
        const body = await c.req.json();

        await db.prepare(`
            UPDATE call_queue 
            SET status = ?
            WHERE id = ?
        `).bind(body.status, id).run();

        return c.json({
            success: true,
            message: 'Queue status updated'
        });
    } catch (error) {
        console.error('Update queue status error:', error);
        return c.json({ error: 'Failed to update queue status: ' + error.message }, 500);
    }
});

export default teams;
