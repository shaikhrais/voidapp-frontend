const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Register
router.post('/register',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;

            // Check if user exists
            let user = await User.findOne({ where: { email } });
            if (user) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 8);

            // Create user
            user = await User.create({
                email,
                password: hashedPassword
            });

            // Generate token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });

            res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Login
router.post('/login',
    [
        body('email').isEmail(),
        body('password').exists()
    ],
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });

            res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Get Current User
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Authentication required' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ user });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Forgot Password
router.post('/forgot-password',
    [body('email').isEmail().withMessage('Valid email required')],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const user = await User.findOne({ where: { email: req.body.email } });
            if (!user) return res.status(404).json({ error: 'User not found' });

            // Generate token
            const resetToken = require('crypto').randomBytes(20).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            // In a real app, send email here. For now, log it.
            console.log(`[Mock Email] Password reset link: http://localhost:3000/reset-password/${resetToken}`);

            res.json({ message: 'Password reset email sent (check server logs)' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Reset Password
router.post('/reset-password',
    [
        body('token').notEmpty(),
        body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { token, newPassword } = req.body;
            const { Op } = require('sequelize');

            const user = await User.findOne({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: { [Op.gt]: Date.now() }
                }
            });

            if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

            // Update password
            user.password = await bcrypt.hash(newPassword, 8);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            res.json({ message: 'Password reset successful' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router;
