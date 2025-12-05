const http = require('http');

const email = `testteam_${Date.now()}@example.com`;
const password = 'password123';

function request(path, method, data, token, callback) {
    const options = {
        hostname: 'localhost',
        port: 3001,
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
        request('/api/organizations', 'POST', JSON.stringify({ name: 'Team Corp' }), token, (orgRes) => {

            console.log('3. Inviting Member...');
            request('/api/organizations/invite', 'POST', JSON.stringify({ email: 'friend@example.com' }), token, () => {

                console.log('4. Creating API Key...');
                request('/api/keys', 'POST', JSON.stringify({ name: 'Dev Key' }), token, (keyRes) => {

                    console.log('5. Listing Keys...');
                    request('/api/keys', 'GET', null, token);
                });
            });
        });
    }
});
