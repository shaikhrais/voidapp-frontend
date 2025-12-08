import { Hono } from 'hono';
import { jwtVerify } from 'jose';
import { createOrgHelper } from '../helpers/organizations.js';

const business = new Hono();

// Auth middleware - Business Admin only
business.use('*', async (c, next) => {
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

        // Check if business admin or super admin
        if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'business_admin') {
            return c.json({ error: 'Business admin access required' }, 403);
        }

        c.set('user', user);
        await next();
    } catch (error) {
        console.error('Auth error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
});

// Get team members
business.get('/team', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        const team = await db.prepare(`
            SELECT u.id, u.email, u.role, u.created_at,
                   p.full_name, p.can_make_calls, p.can_send_sms,
                   p.can_buy_numbers, p.can_manage_users, p.can_view_billing
            FROM users u
            LEFT JOIN user_permissions p ON u.id = p.user_id
            WHERE u.organization_id = ?
            ORDER BY u.created_at DESC
        `).bind(user.organization_id).all();

        return c.json({ team: team.results || [] });
    } catch (error) {
        console.error('Get team error:', error);
        return c.json({ error: 'Failed to fetch team' }, 500);
    }
});

// Invite team member
business.post('/team/invite', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const body = await c.req.json();

        const { email, role, permissions } = body;

        if (!email || !role) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        // Check if email already exists
        const existingUser = await db.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind(email).first();

        if (existingUser) {
            return c.json({ error: 'Email already exists' }, 400);
        }

        // Generate invitation token
        const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
        const invitationId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

        await db.prepare(`
            INSERT INTO invitations (
                id, email, organization_id, invited_by_user_id,
                role, token, status, expires_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            invitationId,
            email,
            user.organization_id,
            user.id,
            role,
            token,
            'pending',
            expiresAt,
            Math.floor(Date.now() / 1000)
        ).run();

        // In a real app, send email with invitation link
        const invitationLink = `https://main.voipapp-frontend.pages.dev/invite/${token}`;

        return c.json({
            success: true,
            invitationLink,
            message: 'Invitation created. Send this link to the user.',
        });
    } catch (error) {
        console.error('Invite error:', error);
        return c.json({ error: 'Failed to create invitation' }, 500);
    }
});

// Update team member permissions
business.put('/team/:userId', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const userId = c.req.param('userId');
        const body = await c.req.json();

        // Verify user belongs to this organization
        const teamMember = await db.prepare(
            'SELECT * FROM users WHERE id = ? AND organization_id = ?'
        ).bind(userId, user.organization_id).first();

        if (!teamMember) {
            return c.json({ error: 'User not found' }, 404);
        }

        const { can_make_calls, can_send_sms, can_buy_numbers, can_manage_users, can_view_billing } = body;

        // Update permissions
        await db.prepare(`
            UPDATE user_permissions
            SET can_make_calls = COALESCE(?, can_make_calls),
                can_send_sms = COALESCE(?, can_send_sms),
                can_buy_numbers = COALESCE(?, can_buy_numbers),
                can_manage_users = COALESCE(?, can_manage_users),
                can_view_billing = COALESCE(?, can_view_billing),
                updated_at = ?
            WHERE user_id = ?
        `).bind(
            can_make_calls,
            can_send_sms,
            can_buy_numbers,
            can_manage_users,
            can_view_billing,
            Math.floor(Date.now() / 1000),
            userId
        ).run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Update permissions error:', error);
        return c.json({ error: 'Failed to update permissions' }, 500);
    }
});

// Remove team member
business.delete('/team/:userId', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const userId = c.req.param('userId');

        // Verify user belongs to this organization
        const teamMember = await db.prepare(
            'SELECT * FROM users WHERE id = ? AND organization_id = ?'
        ).bind(userId, user.organization_id).first();

        if (!teamMember) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Don't allow removing self
        if (userId === user.id) {
            return c.json({ error: 'Cannot remove yourself' }, 400);
        }

        // Delete user
        await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
        await db.prepare('DELETE FROM user_permissions WHERE user_id = ?').bind(userId).run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Remove team member error:', error);
        return c.json({ error: 'Failed to remove team member' }, 500);
    }
});

export default business;
