// Organization hierarchy helpers for multi-tier VOIP SaaS

export class OrganizationHelper {
    constructor(db) {
        this.db = db;
    }

    // Get organization with full details
    async getOrganization(orgId) {
        return await this.db.prepare(
            'SELECT * FROM organizations_v2 WHERE id = ?'
        ).bind(orgId).first();
    }

    // Get organization hierarchy (parent chain)
    async getOrganizationHierarchy(orgId) {
        const hierarchy = [];
        let currentOrgId = orgId;

        while (currentOrgId) {
            const org = await this.getOrganization(currentOrgId);
            if (!org) break;

            hierarchy.push(org);
            currentOrgId = org.parent_organization_id;
        }

        return hierarchy;
    }

    // Get all child organizations
    async getChildOrganizations(parentOrgId, type = null) {
        let query = 'SELECT * FROM organizations_v2 WHERE parent_organization_id = ?';
        const params = [parentOrgId];

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        const result = await this.db.prepare(query).bind(...params).all();
        return result.results || [];
    }

    // Get all organizations in tree (recursive)
    async getOrganizationTree(rootOrgId) {
        const tree = [];
        const queue = [rootOrgId];

        while (queue.length > 0) {
            const currentOrgId = queue.shift();
            const org = await this.getOrganization(currentOrgId);

            if (org) {
                tree.push(org);
                const children = await this.getChildOrganizations(currentOrgId);
                queue.push(...children.map(c => c.id));
            }
        }

        return tree;
    }

    // Check if user has permission in organization
    async hasPermission(userId, permission) {
        const perms = await this.db.prepare(
            'SELECT * FROM user_permissions WHERE user_id = ?'
        ).bind(userId).first();

        if (!perms) return false;
        return perms[permission] === 1;
    }

    // Check if organization can access another organization (hierarchy check)
    async canAccessOrganization(accessorOrgId, targetOrgId) {
        // Super admin can access everything
        const accessor = await this.getOrganization(accessorOrgId);
        if (accessor?.type === 'super_admin') return true;

        // Check if target is in accessor's tree
        const targetHierarchy = await this.getOrganizationHierarchy(targetOrgId);
        return targetHierarchy.some(org => org.id === accessorOrgId);
    }

    // Get pricing for organization
    async getPricing(orgId) {
        const pricing = await this.db.prepare(
            'SELECT * FROM pricing_tiers WHERE organization_id = ? LIMIT 1'
        ).bind(orgId).first();

        if (pricing) return pricing;

        // Fall back to organization's own pricing
        const org = await this.getOrganization(orgId);
        return {
            call_rate_per_minute: org.call_rate_per_minute,
            sms_rate: org.sms_rate,
            number_monthly_fee: org.number_monthly_fee,
        };
    }

    // Create transaction
    async createTransaction(orgId, type, amount, description, relatedId = null) {
        const org = await this.getOrganization(orgId);
        const balanceBefore = org.credits;
        const balanceAfter = type === 'credit'
            ? balanceBefore + amount
            : balanceBefore - amount;

        const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await this.db.prepare(`
            INSERT INTO transactions (
                id, organization_id, type, amount, description,
                balance_before, balance_after, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            transactionId,
            orgId,
            type,
            amount,
            description,
            balanceBefore,
            balanceAfter,
            Math.floor(Date.now() / 1000)
        ).run();

        // Update organization balance
        await this.db.prepare(
            'UPDATE organizations_v2 SET credits = ? WHERE id = ?'
        ).bind(balanceAfter, orgId).run();

        return { transactionId, balanceAfter };
    }

    // Get organization stats
    async getOrganizationStats(orgId) {
        const [calls, messages, numbers, users] = await Promise.all([
            this.db.prepare(
                'SELECT COUNT(*) as count FROM calls WHERE organization_id = ?'
            ).bind(orgId).first(),
            this.db.prepare(
                'SELECT COUNT(*) as count FROM messages WHERE organization_id = ?'
            ).bind(orgId).first(),
            this.db.prepare(
                'SELECT COUNT(*) as count FROM phone_numbers WHERE organization_id = ?'
            ).bind(orgId).first(),
            this.db.prepare(
                'SELECT COUNT(*) as count FROM users WHERE organization_id = ?'
            ).bind(orgId).first(),
        ]);

        return {
            totalCalls: calls?.count || 0,
            totalMessages: messages?.count || 0,
            totalNumbers: numbers?.count || 0,
            totalUsers: users?.count || 0,
        };
    }
}

// Export helper function to create instance
export function createOrgHelper(db) {
    return new OrganizationHelper(db);
}
