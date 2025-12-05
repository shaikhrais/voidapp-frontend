const http = require('http');

const email = `billing_test_${Date.now()}@example.com`;
const password = 'password123';

function request(path, method, data, token, callback) {
    const options = {
        hostname: 'localhost',
        port: 3003,
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
                    request('/api/billing/usage', 'GET', null, token);
                });
            });
        });
    }
});
