const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const sequelize = require('./src/config/database');

// Mock Auth Middleware
const mockAuth = (req, res, next) => {
    req.user = { organizationId: '00000000-0000-0000-0000-000000000000' }; // Mock UUID
    next();
};

// Mock Models
const Organization = require('./src/models/Organization');
const Call = require('./src/models/Call');
const Message = require('./src/models/Message');

async function run() {
    try {
        // Setup DB (Force sync to ensure tables exist for mock data)
        await sequelize.sync({ force: true });

        // Create Mock Org
        await Organization.create({
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Test Org',
            credits: 10.0
        });

        const app = express();
        app.use(bodyParser.json());

        // Mount Billing Routes with Mock Auth
        // We need to intercept the require to replace auth middleware if we can't inject it.
        // Since we can't easily mock require here without jest, we'll rely on the fact that billing.js imports auth.
        // But billing.js imports auth from ../middleware/auth. 
        // We can just mount the router and hope the auth middleware works or we can mock the req.user BEFORE the router.
        // Wait, billing.js uses `router.get('/balance', auth, ...)`
        // So it uses the real auth middleware.
        // The real auth middleware checks for a token.
        // We can generate a valid token if we want, OR we can just test the logic if we can bypass auth.

        // Actually, let's just use the real auth middleware but provide a valid token.
        // We need to create a user and org first.

        const billingRoutes = require('./src/routes/billing');
        app.use('/api/billing', billingRoutes);

        const PORT = 3008;
        const server = app.listen(PORT, async () => {
            console.log(`Isolated Server running on ${PORT}`);

            // We need a token. 
            // Let's just create a User and generate a token manually using jsonwebtoken
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: '11111111-1111-1111-1111-111111111111' }, process.env.JWT_SECRET || 'your_jwt_secret');

            const User = require('./src/models/User');
            await User.create({
                id: '11111111-1111-1111-1111-111111111111',
                email: 'test@example.com',
                password: 'hash',
                organizationId: '00000000-0000-0000-0000-000000000000'
            });

            // Test Balance
            const req = http.request({
                hostname: 'localhost',
                port: PORT,
                path: '/api/billing/balance',
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => {
                    console.log('Balance Response:', data);

                    // Test Checkout
                    const req2 = http.request({
                        hostname: 'localhost',
                        port: PORT,
                        path: '/api/billing/checkout',
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Content-Length': JSON.stringify({ amount: 20 }).length
                        }
                    }, (res2) => {
                        let data2 = '';
                        res2.on('data', c => data2 += c);
                        res2.on('end', () => {
                            console.log('Checkout Response:', data2);
                            server.close();
                            process.exit(0);
                        });
                    });
                    req2.write(JSON.stringify({ amount: 20 }));
                    req2.end();
                });
            });
            req.end();
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
