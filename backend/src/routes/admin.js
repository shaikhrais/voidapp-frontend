import { Hono } from 'hono';
import { jwtVerify } from 'jose';
import { createOrgHelper } from '../helpers/organizations.js';

const admin = new Hono();

// Auth middleware - Super Admin only
admin.use('*', async (c, next) => {
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

        // Check if super admin
        if (user.role !== 'super_admin') {
            return c.json({ error: 'Super admin access required' }, 403);
        }

        c.set('user', user);
        await next();
    } catch (error) {
        console.error('Auth error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
});

// Get dashboard overview
admin.get('/dashboard', async (c) => {
    try {
        const db = c.env.DB;

        // Get counts
        const [agencies, businesses, users, numbers, calls, messages] = await Promise.all([
            db.prepare('SELECT COUNT(*) as count FROM organizations_v2 WHERE type = ?').bind('agency').first(),
            db.prepare('SELECT COUNT(*) as count FROM organizations_v2 WHERE type = ?').bind('business').first(),
            db.prepare('SELECT COUNT(*) as count FROM users').first(),
            db.prepare('SELECT COUNT(*) as count FROM phone_numbers').first(),
            db.prepare('SELECT COUNT(*) as count FROM calls').first(),
            db.prepare('SELECT COUNT(*) as count FROM messages').first(),
        ]);

        // Get total revenue
        const revenue = await db.prepare(
            'SELECT SUM(amount) as total FROM transactions WHERE type = ?'
        ).bind('debit').first();

        // Get recent activity
        const recentOrgs = await db.prepare(
            'SELECT * FROM organizations_v2 ORDER BY created_at DESC LIMIT 5'
        ).all();

        return c.json({
            stats: {
                totalAgencies: agencies?.count || 0,
                totalBusinesses: businesses?.count || 0,
                totalUsers: users?.count || 0,
                totalNumbers: numbers?.count || 0,
                totalCalls: calls?.count || 0,
                totalMessages: messages?.count || 0,
                totalRevenue: revenue?.total || 0,
            },
            recentOrganizations: recentOrgs.results || [],
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        return c.json({ error: 'Failed to fetch dashboard data' }, 500);
    }
});

// List all agencies
admin.get('/agencies', async (c) => {
    try {
        const db = c.env.DB;

        const agencies = await db.prepare(`
            SELECT o.*, u.email as owner_email
            FROM organizations_v2 o
            LEFT JOIN users u ON o.owner_user_id = u.id
            WHERE o.type = 'agency'
            ORDER BY o.created_at DESC
        `).all();

        // Get customer count for each agency
        const agenciesWithStats = await Promise.all(
            (agencies.results || []).map(async (agency) => {
                const customers = await db.prepare(
                    'SELECT COUNT(*) as count FROM organizations_v2 WHERE parent_organization_id = ?'
                ).bind(agency.id).first();

                return {
                    ...agency,
                    customerCount: customers?.count || 0,
                };
            })
        );

        return c.json({ agencies: agenciesWithStats });
    } catch (error) {
        console.error('List agencies error:', error);
        return c.json({ error: 'Failed to fetch agencies' }, 500);
    }
});

// Get agency details
admin.get('/agencies/:id', async (c) => {
    try {
        const db = c.env.DB;
        const agencyId = c.req.param('id');
        const orgHelper = createOrgHelper(db);

        const agency = await orgHelper.getOrganization(agencyId);
        if (!agency || agency.type !== 'agency') {
            return c.json({ error: 'Agency not found' }, 404);
        }

        // Get customers
        const customers = await orgHelper.getChildOrganizations(agencyId, 'business');

        // Get stats
        const stats = await orgHelper.getOrganizationStats(agencyId);

        return c.json({
            agency,
            customers,
            stats,
        });
    } catch (error) {
        console.error('Get agency error:', error);
        return c.json({ error: 'Failed to fetch agency details' }, 500);
    }
});

// Create new agency
admin.post('/agencies', async (c) => {
    try {
        const db = c.env.DB;
        const body = await c.req.json();

        const { name, email, password, billing_email, call_rate, sms_rate, number_fee } = body;

        if (!name || !email || !password) {
            return c.json({ error: 'Missing required fields: name, email, password' }, 400);
        }

        // Check if email already exists
        const existingUser = await db.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind(email).first();

        if (existingUser) {
            return c.json({ error: 'Email already exists' }, 400);
        }

        // Generate IDs
        const orgId = `org-agency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Hash password
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Create organization
        await db.prepare(`
            INSERT INTO organizations_v2 (
                id, name, type, parent_organization_id, owner_user_id,
                credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            orgId,
            name,
            'agency',
            'org-super-admin',
            userId,
            0.0,
            billing_email || email,
            call_rate || 0.02,
            sms_rate || 0.01,
            number_fee || 2.00,
            'active',
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000)
        ).run();

        // Create user
        await db.prepare(`
            INSERT INTO users (
                id, email, password, role, organization_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            userId,
            email,
            hashedPassword,
            'agency_admin',
            orgId,
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000)
        ).run();

        // Set permissions
        await db.prepare(`
            INSERT INTO user_permissions (
                user_id, full_name, can_make_calls, can_send_sms, 
                can_buy_numbers, can_manage_users, can_view_billing
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, name, 1, 1, 1, 1, 1).run();

        // Create pricing tier
        const tierId = `tier-${orgId}`;
        await db.prepare(`
            INSERT INTO pricing_tiers (
                id, organization_id, name, call_rate_per_minute, sms_rate, number_monthly_fee
            ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            tierId,
            orgId,
            'Agency Pricing',
            call_rate || 0.02,
            sms_rate || 0.01,
            number_fee || 2.00
        ).run();

        return c.json({
            success: true,
            agency: {
                id: orgId,
                name,
                email,
            },
        }, 201);
    } catch (error) {
        console.error('Create agency error:', error);
        return c.json({ error: 'Failed to create agency: ' + error.message }, 500);
    }
});

// Update agency
admin.put('/agencies/:id', async (c) => {
    try {
        const db = c.env.DB;
        const agencyId = c.req.param('id');
        const body = await c.req.json();

        const { name, billing_email, call_rate, sms_rate, number_fee, status } = body;

        await db.prepare(`
            UPDATE organizations_v2 
            SET name = COALESCE(?, name),
                billing_email = COALESCE(?, billing_email),
                call_rate_per_minute = COALESCE(?, call_rate_per_minute),
                sms_rate = COALESCE(?, sms_rate),
                number_monthly_fee = COALESCE(?, number_monthly_fee),
                status = COALESCE(?, status),
                updated_at = ?
            WHERE id = ? AND type = 'agency'
        `).bind(
            name,
            billing_email,
            call_rate,
            sms_rate,
            number_fee,
            status,
            Math.floor(Date.now() / 1000),
            agencyId
        ).run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Update agency error:', error);
        return c.json({ error: 'Failed to update agency' }, 500);
    }
});

// Delete/suspend agency
admin.delete('/agencies/:id', async (c) => {
    try {
        const db = c.env.DB;
        const agencyId = c.req.param('id');

        // Soft delete - set status to cancelled
        await db.prepare(
            'UPDATE organizations_v2 SET status = ?, updated_at = ? WHERE id = ?'
        ).bind('cancelled', Math.floor(Date.now() / 1000), agencyId).run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Delete agency error:', error);
        return c.json({ error: 'Failed to delete agency' }, 500);
    }
});

// Get global analytics
admin.get('/analytics', async (c) => {
    try {
        const db = c.env.DB;

        // Revenue by agency
        const revenueByAgency = await db.prepare(`
            SELECT o.id, o.name, SUM(t.amount) as revenue
            FROM organizations_v2 o
            LEFT JOIN transactions t ON o.id = t.organization_id
            WHERE o.type = 'agency' AND t.type = 'debit'
            GROUP BY o.id, o.name
            ORDER BY revenue DESC
        `).all();

        // Call volume over time (last 30 days)
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
        const callVolume = await db.prepare(`
            SELECT DATE(created_at, 'unixepoch') as date, COUNT(*) as count
            FROM calls
            WHERE created_at >= ?
            GROUP BY date
            ORDER BY date
        `).bind(thirtyDaysAgo).all();

        // User growth
        const userGrowth = await db.prepare(`
            SELECT DATE(created_at, 'unixepoch') as date, COUNT(*) as count
            FROM users
            WHERE created_at >= ?
            GROUP BY date
            ORDER BY date
        `).bind(thirtyDaysAgo).all();

        return c.json({
            revenueByAgency: revenueByAgency.results || [],
            callVolume: callVolume.results || [],
            userGrowth: userGrowth.results || [],
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return c.json({ error: 'Failed to fetch analytics' }, 500);
    }
});

export default admin;
