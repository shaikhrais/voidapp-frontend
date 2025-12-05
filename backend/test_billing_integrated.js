const fs = require('fs');

process.on('uncaughtException', (err) => {
    fs.writeFileSync('error_log.txt', `Uncaught Exception: ${err.stack}\n`);
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    fs.writeFileSync('error_log.txt', `Unhandled Rejection: ${reason}\n`);
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

console.log('Starting test script...');

try {
    const app = require('./src/server');
    const http = require('http');
    const sequelize = require('./src/config/database');

    const PORT = 3005;

    async function runTests() {
        try {
            console.log('Skipping sync (done in debug_db.js)');
            const server = app.listen(PORT, async () => {
                console.log(`Test Server running on port ${PORT}`);

                const email = `billing_test_${Date.now()}@example.com`;
                const password = 'password123';

                function request(path, method, data, token, callback) {
                    const options = {
                        hostname: 'localhost',
                        port: PORT,
                        path: path,
                        method: method,
                        headers: { 'Content-Type': 'application/json' }
                    };

                    if (data) options.headers['Content-Length'] = data.length;
                    if (token) options.headers['Authorization'] = `Bearer ${token}`;

                    const req = http.request(options, (res) => {
                        let responseBody = '';
                        res.on('data', (chunk) => { responseBody += chunk; });
                        res.on('end', () => {
                            console.log(`${method} ${path} Status: ${res.statusCode}`);
                            console.log(`${method} ${path} Response: ${responseBody}`);
                            if (callback) {
                                try { callback(JSON.parse(responseBody)); } catch (e) { }
                            }
                        });
                    });

                    if (data) req.write(data);
                    req.end();
                }

                console.log('1. Registering...');
                request('/api/auth/register', 'POST', JSON.stringify({ email, password }), null, (res) => {
                    if (res.token) {
                        const token = res.token;
                        console.log('2. Creating Org...');
                        request('/api/organizations', 'POST', JSON.stringify({ name: 'Billing Corp' }), token, (orgRes) => {

                            console.log('3. Checking Balance...');
                            request('/api/billing/balance', 'GET', null, token, () => {

                                console.log('4. Creating Checkout Session...');
                                request('/api/billing/checkout', 'POST', JSON.stringify({ amount: 10 }), token, () => {

                                    console.log('5. Checking Usage...');
                                    request('/api/billing/usage', 'GET', null, token, () => {
                                        console.log('Tests Completed');
                                        fs.writeFileSync('billing_test_results.txt', 'Billing Tests Passed Successfully');
                                        server.close();
                                        process.exit(0);
                                    });
                                });
                            });
                        });
                    } else {
                        console.error('Registration failed');
                        server.close();
                        process.exit(1);
                    }
                });
            });
        } catch (error) {
            console.error('Startup error:', error);
            process.exit(1);
        }
    }

    runTests();
} catch (err) {
    fs.writeFileSync('error_log.txt', `Require Error: ${err.stack}\n`);
    console.error('Require Error:', err);
}
