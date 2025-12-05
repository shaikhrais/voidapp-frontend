const http = require('http');

const registerData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
});

const loginData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
});

function request(path, data, callback) {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            console.log(`${path} Status: ${res.statusCode}`);
            console.log(`${path} Response: ${responseBody}`);
            if (callback) callback(JSON.parse(responseBody));
        });
    });

    req.on('error', (error) => { console.error('Error:', error); });
    req.write(data);
    req.end();
}

console.log('Testing Registration...');
request('/api/auth/register', registerData, (res) => {
    if (res.token) {
        console.log('Registration Successful. Testing Login...');
        request('/api/auth/login', loginData);
    }
});
