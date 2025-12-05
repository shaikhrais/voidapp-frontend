const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Organization = require('../models/Organization');
const User = require('../models/User');

// Create Organization
router.post('/', auth, async (req, res) => {
    try {
        const { name } = req.body;

        if (req.user.organizationId) {
            return res.status(400).json({ error: 'User already belongs to an organization' });
        }

        const organization = await Organization.create({ name });

        // Link user to organization
        req.user.organizationId = organization.id;
        req.user.role = 'admin'; // Creator becomes admin of the org
        await req.user.save();

        res.status(201).json({ organization });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get My Organization
router.get('/me', auth, async (req, res) => {
    try {
        if (!req.user.organizationId) {
            return res.status(404).json({ error: 'No organization found' });
        }

        const organization = await Organization.findByPk(req.user.organizationId);
        res.json({ organization });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Invite User
router.post('/invite', auth, async (req, res) => {
    try {
        const { email } = req.body;
        if (!req.user.organizationId) {
            return res.status(400).json({ error: 'You must belong to an organization to invite others' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            if (existingUser.organizationId) {
                return res.status(400).json({ error: 'User already belongs to an organization' });
            }
            // Add directly
            existingUser.organizationId = req.user.organizationId;
            await existingUser.save();
            return res.json({ message: 'User added to organization' });
        }

        // Create invitation
        const Invitation = require('../models/Invitation');
        const token = require('crypto').randomBytes(20).toString('hex');

        await Invitation.create({
            email,
            token,
            organizationId: req.user.organizationId
        });

        // Mock Email
        console.log(`[Mock Email] Invite link: http://localhost:3000/join/${token}`);

        res.json({ message: 'Invitation sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
