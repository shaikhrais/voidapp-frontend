const http = require('http');

const email = `testorg_${Date.now()}@example.com`;
const password = 'password123';

function request(path, method, data, token, callback) {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (data) {
        options.headers['Content-Length'] = data.length;
    }

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            console.log(`${method} ${path} Status: ${res.statusCode}`);
            console.log(`${method} ${path} Response: ${responseBody}`);
            if (callback) {
                try {
                    callback(JSON.parse(responseBody));
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                }
            }
        });
    });

    req.on('error', (error) => { console.error('Error:', error); });
    if (data) req.write(data);
    req.end();
}

console.log(`1. Registering user: ${email}`);
request('/api/auth/register', 'POST', JSON.stringify({ email, password }), null, (res) => {
    if (res.token) {
        const token = res.token;
        console.log('Registration successful. Token received.');

        console.log('2. Creating Organization...');
        request('/api/organizations', 'POST', JSON.stringify({ name: 'My Test Corp' }), token, (orgRes) => {
            if (orgRes.organization) {
                console.log('Organization created:', orgRes.organization.name);

                console.log('3. Fetching My Organization...');
                request('/api/organizations/me', 'GET', null, token, (meRes) => {
                    console.log('My Organization Details:', meRes);
                });
            }
        });
    }
});
