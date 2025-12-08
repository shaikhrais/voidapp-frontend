// Add this new endpoint after the existing /team/invite endpoint

// Create user directly (no invitation needed)
business.post('/team/create', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const body = await c.req.json();

        const { email, role, full_name, password } = body;

        if (!email || !role) {
            return c.json({ error: 'Missing required fields: email, role' }, 400);
        }

        // Check if email already exists
        const existingUser = await db.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind(email).first();

        if (existingUser) {
            return c.json({ error: 'Email already exists' }, 400);
        }

        // Generate user ID
        const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Use provided password or generate temporary one
        const tempPassword = password || `Temp${Math.random().toString(36).substr(2, 8)}!`;

        // Hash password
        const encoder = new TextEncoder();
        const data = encoder.encode(tempPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Create user
        await db.prepare(`
            INSERT INTO users (
                id, email, password, role, organization_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            userId,
            email,
            hashedPassword,
            role,
            user.organization_id,
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000)
        ).run();

        // Set default permissions
        await db.prepare(`
            INSERT INTO user_permissions (
                user_id, full_name, can_make_calls, can_send_sms,
                can_buy_numbers, can_manage_users, can_view_billing
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            userId,
            full_name || email.split('@')[0],
            role === 'business_admin' ? 1 : 0,  // Admins get all permissions
            role === 'business_admin' ? 1 : 0,
            role === 'business_admin' ? 1 : 0,
            role === 'business_admin' ? 1 : 0,
            role === 'business_admin' ? 1 : 0
        ).run();

        return c.json({
            success: true,
            user: {
                id: userId,
                email,
                role,
                temporaryPassword: password ? undefined : tempPassword  // Only return if auto-generated
            },
            message: password ? 'User created successfully' : `User created with temporary password: ${tempPassword}`
        });
    } catch (error) {
        console.error('Create user error:', error);
        return c.json({ error: 'Failed to create user: ' + error.message }, 500);
    }
});
