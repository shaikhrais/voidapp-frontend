import { Hono } from 'hono';
import { jwtVerify } from 'jose';
import { createOrgHelper } from '../helpers/organizations.js';

const agency = new Hono();

// Auth middleware - Agency Admin only
agency.use('*', async (c, next) => {
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

        // Check if agency admin
        if (user.role !== 'agency_admin' && user.role !== 'super_admin') {
            return c.json({ error: 'Agency admin access required' }, 403);
        }

        c.set('user', user);
        await next();
    } catch (error) {
        console.error('Auth error:', error);
        return c.json({ error: 'Invalid token' }, 401);
    }
});

// Get agency dashboard
agency.get('/dashboard', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const orgHelper = createOrgHelper(db);

        // Get agency organization
        const agency = await orgHelper.getOrganization(user.organization_id);

        // Get customers
        const customers = await orgHelper.getChildOrganizations(user.organization_id, 'business');

        // Get total stats across all customers
        let totalCalls = 0;
        let totalMessages = 0;
        let totalNumbers = 0;
        let totalUsers = 0;

        for (const customer of customers) {
            const stats = await orgHelper.getOrganizationStats(customer.id);
            totalCalls += stats.totalCalls;
            totalMessages += stats.totalMessages;
            totalNumbers += stats.totalNumbers;
            totalUsers += stats.totalUsers;
        }

        // Get revenue
        const revenue = await db.prepare(
            'SELECT SUM(amount) as total FROM transactions WHERE organization_id = ? AND type = ?'
        ).bind(user.organization_id, 'credit').first();

        return c.json({
            agency,
            stats: {
                totalCustomers: customers.length,
                totalCalls,
                totalMessages,
                totalNumbers,
                totalUsers,
                totalRevenue: revenue?.total || 0,
                credits: agency.credits,
            },
            recentCustomers: customers.slice(0, 5),
        });
    } catch (error) {
        console.error('Agency dashboard error:', error);
        return c.json({ error: 'Failed to fetch dashboard data' }, 500);
    }
});

// List customers
agency.get('/customers', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const orgHelper = createOrgHelper(db);

        const customers = await orgHelper.getChildOrganizations(user.organization_id, 'business');

        // Get stats for each customer
        const customersWithStats = await Promise.all(
            customers.map(async (customer) => {
                const stats = await orgHelper.getOrganizationStats(customer.id);
                const users = await db.prepare(
                    'SELECT COUNT(*) as count FROM users WHERE organization_id = ?'
                ).bind(customer.id).first();

                return {
                    ...customer,
                    ...stats,
                    userCount: users?.count || 0,
                };
            })
        );

        return c.json({ customers: customersWithStats });
    } catch (error) {
        console.error('List customers error:', error);
        return c.json({ error: 'Failed to fetch customers' }, 500);
    }
});

// Create customer
agency.post('/customers', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const body = await c.req.json();

        const { name, email, password, call_rate, sms_rate, number_fee } = body;

        if (!name || !email || !password) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        // Check if email exists
        const existingUser = await db.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind(email).first();

        if (existingUser) {
            return c.json({ error: 'Email already exists' }, 400);
        }

        // Get agency pricing
        const agency = await db.prepare(
            'SELECT * FROM organizations_v2 WHERE id = ?'
        ).bind(user.organization_id).first();

        // Generate IDs
        const orgId = `org-business-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
            'business',
            user.organization_id,
            userId,
            0.0,
            email,
            call_rate || agency.call_rate_per_minute,
            sms_rate || agency.sms_rate,
            number_fee || agency.number_monthly_fee,
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
            'business_admin',
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

        return c.json({
            success: true,
            customer: { id: orgId, name, email },
        }, 201);
    } catch (error) {
        console.error('Create customer error:', error);
        return c.json({ error: 'Failed to create customer: ' + error.message }, 500);
    }
});

// Update customer
agency.put('/customers/:id', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const customerId = c.req.param('id');
        const body = await c.req.json();

        // Verify customer belongs to this agency
        const customer = await db.prepare(
            'SELECT * FROM organizations_v2 WHERE id = ? AND parent_organization_id = ?'
        ).bind(customerId, user.organization_id).first();

        if (!customer) {
            return c.json({ error: 'Customer not found' }, 404);
        }

        const { name, call_rate, sms_rate, number_fee, status } = body;

        await db.prepare(`
            UPDATE organizations_v2
            SET name = COALESCE(?, name),
                call_rate_per_minute = COALESCE(?, call_rate_per_minute),
                sms_rate = COALESCE(?, sms_rate),
                number_monthly_fee = COALESCE(?, number_monthly_fee),
                status = COALESCE(?, status),
                updated_at = ?
            WHERE id = ?
        `).bind(
            name,
            call_rate,
            sms_rate,
            number_fee,
            status,
            Math.floor(Date.now() / 1000),
            customerId
        ).run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Update customer error:', error);
        return c.json({ error: 'Failed to update customer' }, 500);
    }
});

// Get revenue analytics
agency.get('/revenue', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        // Get revenue by customer
        const revenueByCustomer = await db.prepare(`
            SELECT o.id, o.name, SUM(t.amount) as revenue
            FROM organizations_v2 o
            LEFT JOIN transactions t ON o.id = t.organization_id
            WHERE o.parent_organization_id = ? AND t.type = 'debit'
            GROUP BY o.id, o.name
            ORDER BY revenue DESC
        `).bind(user.organization_id).all();

        return c.json({
            revenueByCustomer: revenueByCustomer.results || [],
        });
    } catch (error) {
        console.error('Revenue error:', error);
        return c.json({ error: 'Failed to fetch revenue data' }, 500);
    }
});

export default agency;
