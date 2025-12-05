const app = require('./src/server');
const http = require('http');
const sequelize = require('./src/config/database');

const PORT = 3007;

async function run() {
    try {
        console.log('Starting server...');
        const server = app.listen(PORT, async () => {
            console.log(`Server running on ${PORT}`);

            const email = `simple_test_${Date.now()}@example.com`;
            const password = 'password123';

            // 1. Register
            const postData = JSON.stringify({ email, password });
            const req = http.request({
                hostname: 'localhost',
                port: PORT,
                path: '/api/auth/register',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
            }, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => {
                    const token = JSON.parse(data).token;
                    console.log('Got Token:', token ? 'YES' : 'NO');

                    // 2. Create Org
                    const orgData = JSON.stringify({ name: 'Test Org' });
                    const req2 = http.request({
                        hostname: 'localhost',
                        port: PORT,
                        path: '/api/organizations',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': orgData.length,
                            'Authorization': `Bearer ${token}`
                        }
                    }, (res2) => {
                        let data2 = '';
                        res2.on('data', c => data2 += c);
                        res2.on('end', () => {
                            console.log('Org Created:', res2.statusCode);

                            // 3. Check Balance
                            const req3 = http.request({
                                hostname: 'localhost',
                                port: PORT,
                                path: '/api/billing/balance',
                                method: 'GET',
                                headers: { 'Authorization': `Bearer ${token}` }
                            }, (res3) => {
                                let data3 = '';
                                res3.on('data', c => data3 += c);
                                res3.on('end', () => {
                                    console.log('Balance Response:', data3);
                                    server.close();
                                    process.exit(0);
                                });
                            });
                            req3.end();
                        });
                    });
                    req2.write(orgData);
                    req2.end();
                });
            });
            req.write(postData);
            req.end();
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
