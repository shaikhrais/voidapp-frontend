const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Organization = require('../models/Organization');
const Call = require('../models/Call');
const Message = require('../models/Message');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

// Get Balance
router.get('/balance', auth, async (req, res) => {
    try {
        if (!req.user.organizationId) return res.status(400).json({ error: 'No organization' });

        const org = await Organization.findByPk(req.user.organizationId);
        res.json({ credits: org.credits });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Usage History
router.get('/usage', auth, async (req, res) => {
    try {
        if (!req.user.organizationId) return res.status(400).json({ error: 'No organization' });

        const calls = await Call.findAll({
            where: { organizationId: req.user.organizationId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        const messages = await Message.findAll({
            where: { organizationId: req.user.organizationId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({ calls, messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Checkout Session (Add Credits)
router.post('/checkout', auth, async (req, res) => {
    try {
        if (!req.user.organizationId) return res.status(400).json({ error: 'No organization' });
        const { amount } = req.body; // Amount in dollars

        if (!amount || amount < 5) return res.status(400).json({ error: 'Minimum amount is $5' });

        // Mock Stripe Session if no key or stripe instance
        if (!stripe || !process.env.STRIPE_SECRET_KEY) {
            return res.json({
                url: 'http://localhost:3000/mock-checkout?success=true',
                mock: true
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'VoIP Credits' },
                    unit_amount: amount * 100,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?success=true`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
            metadata: {
                organizationId: req.user.organizationId
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Customer Portal
router.post('/portal', auth, async (req, res) => {
    try {
        // Mock Portal
        res.json({ url: 'https://billing.stripe.com/p/login/mock' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
