const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

// List Keys
router.get('/', auth, async (req, res) => {
    try {
        if (!req.user.organizationId) return res.status(400).json({ error: 'No organization' });

        const keys = await ApiKey.findAll({
            where: { organizationId: req.user.organizationId }
        });

        res.json({ keys });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Key
router.post('/', auth, async (req, res) => {
    try {
        if (!req.user.organizationId) return res.status(400).json({ error: 'No organization' });

        const { name } = req.body;
        const key = 'sk_' + crypto.randomBytes(24).toString('hex');

        const apiKey = await ApiKey.create({
            key,
            name,
            organizationId: req.user.organizationId
        });

        res.status(201).json({ apiKey });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Revoke Key
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const key = await ApiKey.findOne({
            where: { id, organizationId: req.user.organizationId }
        });

        if (!key) return res.status(404).json({ error: 'Key not found' });

        await key.destroy();
        res.json({ message: 'Key revoked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
