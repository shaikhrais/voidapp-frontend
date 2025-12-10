import { Hono } from 'hono';
import { jwtVerify } from 'jose';

const contacts = new Hono();

// Auth middleware
contacts.use('*', async (c, next) => {
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

// Get all contacts (with optional search)
contacts.get('/', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { q, favorite } = c.req.query();

        let query = 'SELECT * FROM contacts WHERE user_id = ?';
        const params = [user.id];

        if (favorite === 'true') {
            query += ' AND favorite = 1';
        }

        if (q) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ? OR company LIKE ?)';
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY favorite DESC, first_name ASC';

        const result = await db.prepare(query).bind(...params).all();

        return c.json({
            success: true,
            contacts: result.results || []
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        return c.json({ error: 'Failed to fetch contacts: ' + error.message }, 500);
    }
});

// Search contacts
contacts.get('/search', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { q } = c.req.query();

        if (!q) {
            return c.json({ success: true, contacts: [] });
        }

        const searchTerm = `%${q}%`;
        const result = await db.prepare(`
            SELECT * FROM contacts 
            WHERE user_id = ? 
            AND (first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ? OR company LIKE ?)
            ORDER BY favorite DESC, first_name ASC
            LIMIT 50
        `).bind(user.id, searchTerm, searchTerm, searchTerm, searchTerm).all();

        return c.json({
            success: true,
            contacts: result.results || []
        });
    } catch (error) {
        console.error('Search contacts error:', error);
        return c.json({ error: 'Failed to search contacts: ' + error.message }, 500);
    }
});

// Get favorites only
contacts.get('/favorites', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');

        const result = await db.prepare(`
            SELECT * FROM contacts 
            WHERE user_id = ? AND favorite = 1
            ORDER BY first_name ASC
        `).bind(user.id).all();

        return c.json({
            success: true,
            contacts: result.results || []
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        return c.json({ error: 'Failed to fetch favorites: ' + error.message }, 500);
    }
});

// Get contact by phone number
contacts.get('/by-phone/:phone', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { phone } = c.req.param();

        const contact = await db.prepare(`
            SELECT * FROM contacts 
            WHERE user_id = ? AND phone_number = ?
        `).bind(user.id, phone).first();

        if (!contact) {
            return c.json({ success: true, contact: null });
        }

        return c.json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Get contact by phone error:', error);
        return c.json({ error: 'Failed to fetch contact: ' + error.message }, 500);
    }
});

// Get single contact
contacts.get('/:id', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { id } = c.req.param();

        const contact = await db.prepare(`
            SELECT * FROM contacts 
            WHERE id = ? AND user_id = ?
        `).bind(id, user.id).first();

        if (!contact) {
            return c.json({ error: 'Contact not found' }, 404);
        }

        return c.json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Get contact error:', error);
        return c.json({ error: 'Failed to fetch contact: ' + error.message }, 500);
    }
});

// Create contact
contacts.post('/', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { first_name, last_name, phone_number, email, company, notes, tags, favorite } = await c.req.json();

        if (!first_name || !phone_number) {
            return c.json({ error: 'First name and phone number are required' }, 400);
        }

        const contactId = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = Math.floor(Date.now() / 1000);

        await db.prepare(`
            INSERT INTO contacts (
                id, user_id, organization_id, first_name, last_name, 
                phone_number, email, company, notes, tags, favorite,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            contactId,
            user.id,
            user.organization_id,
            first_name,
            last_name || null,
            phone_number,
            email || null,
            company || null,
            notes || null,
            tags ? JSON.stringify(tags) : null,
            favorite ? 1 : 0,
            now,
            now
        ).run();

        const contact = await db.prepare('SELECT * FROM contacts WHERE id = ?').bind(contactId).first();

        return c.json({
            success: true,
            contact
        }, 201);
    } catch (error) {
        console.error('Create contact error:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'Contact with this phone number already exists' }, 409);
        }
        return c.json({ error: 'Failed to create contact: ' + error.message }, 500);
    }
});

// Update contact
contacts.put('/:id', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { id } = c.req.param();
        const { first_name, last_name, phone_number, email, company, notes, tags, favorite } = await c.req.json();

        // Check if contact exists and belongs to user
        const existing = await db.prepare('SELECT id FROM contacts WHERE id = ? AND user_id = ?').bind(id, user.id).first();
        if (!existing) {
            return c.json({ error: 'Contact not found' }, 404);
        }

        const now = Math.floor(Date.now() / 1000);

        await db.prepare(`
            UPDATE contacts SET
                first_name = ?,
                last_name = ?,
                phone_number = ?,
                email = ?,
                company = ?,
                notes = ?,
                tags = ?,
                favorite = ?,
                updated_at = ?
            WHERE id = ? AND user_id = ?
        `).bind(
            first_name,
            last_name || null,
            phone_number,
            email || null,
            company || null,
            notes || null,
            tags ? JSON.stringify(tags) : null,
            favorite ? 1 : 0,
            now,
            id,
            user.id
        ).run();

        const contact = await db.prepare('SELECT * FROM contacts WHERE id = ?').bind(id).first();

        return c.json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Update contact error:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'Contact with this phone number already exists' }, 409);
        }
        return c.json({ error: 'Failed to update contact: ' + error.message }, 500);
    }
});

// Toggle favorite
contacts.post('/:id/favorite', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { id } = c.req.param();

        const contact = await db.prepare('SELECT favorite FROM contacts WHERE id = ? AND user_id = ?').bind(id, user.id).first();
        if (!contact) {
            return c.json({ error: 'Contact not found' }, 404);
        }

        const newFavorite = contact.favorite ? 0 : 1;
        const now = Math.floor(Date.now() / 1000);

        await db.prepare(`
            UPDATE contacts SET favorite = ?, updated_at = ?
            WHERE id = ? AND user_id = ?
        `).bind(newFavorite, now, id, user.id).run();

        return c.json({
            success: true,
            favorite: newFavorite === 1
        });
    } catch (error) {
        console.error('Toggle favorite error:', error);
        return c.json({ error: 'Failed to toggle favorite: ' + error.message }, 500);
    }
});

// Delete contact
contacts.delete('/:id', async (c) => {
    try {
        const db = c.env.DB;
        const user = c.get('user');
        const { id } = c.req.param();

        const result = await db.prepare('DELETE FROM contacts WHERE id = ? AND user_id = ?').bind(id, user.id).run();

        if (result.meta.changes === 0) {
            return c.json({ error: 'Contact not found' }, 404);
        }

        return c.json({
            success: true
        });
    } catch (error) {
        console.error('Delete contact error:', error);
        return c.json({ error: 'Failed to delete contact: ' + error.message }, 500);
    }
});

export default contacts;
