const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * VOIP SaaS Backend Test Suite
 * Automated testing for all API endpoints
 */

class BackendTester {
    constructor() {
        this.baseURL = process.env.API_URL || 'https://voipapp.itpro-mohammed.workers.dev/api';
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            startTime: new Date(),
            endTime: null
        };
        this.tokens = {};
    }

    // Utility: Log with timestamp
    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'INFO': '📋',
            'PASS': '✅',
            'FAIL': '❌',
            'SKIP': '⏭️',
            'WARN': '⚠️'
        }[level] || 'ℹ️';
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    // Utility: Assert
    assert(condition, testName, errorMsg = '') {
        if (condition) {
            this.results.passed++;
            this.results.tests.push({
                name: testName,
                status: 'PASS',
                timestamp: new Date()
            });
            this.log(`PASS: ${testName}`, 'PASS');
            return true;
        } else {
            this.results.failed++;
            this.results.tests.push({
                name: testName,
                status: 'FAIL',
                error: errorMsg,
                timestamp: new Date()
            });
            this.log(`FAIL: ${testName}${errorMsg ? ': ' + errorMsg : ''}`, 'FAIL');
            return false;
        }
    }

    // Test 1: Health Check
    async testHealthCheck() {
        this.log('Test Group 1: Health Check', 'INFO');
        try {
            const response = await axios.get(`${this.baseURL.replace('/api', '')}/health`);
            this.assert(response.status === 200, 'Health endpoint returns 200');
            this.assert(response.data.status === 'OK', 'Health status is OK');
            this.assert(!!response.data.version, 'Version is present');
            return true;
        } catch (error) {
            this.assert(false, 'Health endpoint accessible', error.message);
            return false;
        }
    }

    // Test 2: Authentication
    async testAuthentication() {
        this.log('Test Group 2: Authentication', 'INFO');

        // Test login with super admin
        try {
            const response = await axios.post(`${this.baseURL}/auth/login`, {
                email: 'itpro.mohammed@gmail.com',
                password: 'Rsoft@999'
            });

            this.assert(response.status === 200, 'Login returns 200');
            this.assert(!!response.data.token, 'Login returns token');
            this.assert(!!response.data.user, 'Login returns user object');
            this.assert(response.data.user.role === 'super_admin', 'Super admin role correct');

            this.tokens.super_admin = response.data.token;
            return true;
        } catch (error) {
            this.assert(false, 'Super admin login', error.message);
            return false;
        }
    }

    // Test 3: Auth /me endpoint
    async testAuthMe() {
        this.log('Test Group 3: Auth /me Endpoint', 'INFO');

        if (!this.tokens.super_admin) {
            this.log('Skipping /me test - no token available', 'SKIP');
            this.results.skipped++;
            return false;
        }

        try {
            const response = await axios.get(`${this.baseURL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${this.tokens.super_admin}` }
            });

            this.assert(response.status === 200, '/me endpoint returns 200');
            this.assert(!!response.data.user, '/me returns user object');
            this.assert(!!response.data.user.role, 'User has role field');
            this.assert(!!response.data.user.organization_id, 'User has organization_id field');
            return true;
        } catch (error) {
            this.assert(false, '/me endpoint accessible', error.message);
            return false;
        }
    }

    // Test 4: Billing Endpoints
    async testBillingEndpoints() {
        this.log('Test Group 4: Billing Endpoints', 'INFO');

        if (!this.tokens.super_admin) {
            this.log('Skipping billing tests - no token available', 'SKIP');
            this.results.skipped += 2;
            return false;
        }

        const headers = { 'Authorization': `Bearer ${this.tokens.super_admin}` };

        // Test balance
        try {
            const response = await axios.get(`${this.baseURL}/billing/balance`, { headers });
            this.assert(response.status === 200, 'Billing balance returns 200');
            this.assert(typeof response.data.balance === 'number', 'Balance is a number');
        } catch (error) {
            this.assert(false, 'Billing balance endpoint', error.message);
        }

        // Test usage
        try {
            const response = await axios.get(`${this.baseURL}/billing/usage`, { headers });
            this.assert(response.status === 200, 'Billing usage returns 200');
            this.assert(typeof response.data.calls === 'number', 'Calls count is a number');
            this.assert(typeof response.data.messages === 'number', 'Messages count is a number');
        } catch (error) {
            this.assert(false, 'Billing usage endpoint', error.message);
        }
    }

    // Test 5: Admin Endpoints
    async testAdminEndpoints() {
        this.log('Test Group 5: Admin Endpoints', 'INFO');

        if (!this.tokens.super_admin) {
            this.log('Skipping admin tests - no token available', 'SKIP');
            this.results.skipped += 3;
            return false;
        }

        const headers = { 'Authorization': `Bearer ${this.tokens.super_admin}` };

        // Test dashboard
        try {
            const response = await axios.get(`${this.baseURL}/admin/dashboard`, { headers });
            this.assert(response.status === 200, 'Admin dashboard returns 200');
            this.assert(!!response.data.stats, 'Dashboard has stats object');
        } catch (error) {
            this.assert(false, 'Admin dashboard endpoint', error.message);
        }

        // Test agencies list
        try {
            const response = await axios.get(`${this.baseURL}/admin/agencies`, { headers });
            this.assert(response.status === 200, 'Admin agencies list returns 200');
            this.assert(Array.isArray(response.data.agencies), 'Agencies is an array');
        } catch (error) {
            this.assert(false, 'Admin agencies endpoint', error.message);
        }

        // Test analytics
        try {
            const response = await axios.get(`${this.baseURL}/admin/analytics`, { headers });
            this.assert(response.status === 200, 'Admin analytics returns 200');
        } catch (error) {
            this.assert(false, 'Admin analytics endpoint', error.message);
        }
    }

    // Test 6: Authorization (403 tests)
    async testAuthorization() {
        this.log('Test Group 6: Authorization', 'INFO');

        if (!this.tokens.super_admin) {
            this.log('Skipping authorization tests - no token available', 'SKIP');
            this.results.skipped += 2;
            return false;
        }

        // Test accessing admin endpoint without token
        try {
            await axios.get(`${this.baseURL}/admin/dashboard`);
            this.assert(false, 'Admin endpoint blocks unauthenticated requests', 'Should return 401');
        } catch (error) {
            this.assert(error.response?.status === 401, 'Admin endpoint returns 401 without token');
        }

        // Test accessing billing without token
        try {
            await axios.get(`${this.baseURL}/billing/balance`);
            this.assert(false, 'Billing endpoint blocks unauthenticated requests', 'Should return 401');
        } catch (error) {
            this.assert(error.response?.status === 401, 'Billing endpoint returns 401 without token');
        }
    }

    // Test 7: Numbers Endpoint
    async testNumbersEndpoint() {
        this.log('Test Group 7: Numbers Endpoint', 'INFO');

        if (!this.tokens.super_admin) {
            this.log('Skipping numbers test - no token available', 'SKIP');
            this.results.skipped++;
            return false;
        }

        try {
            const response = await axios.get(`${this.baseURL}/numbers`, {
                headers: { 'Authorization': `Bearer ${this.tokens.super_admin}` }
            });
            this.assert(response.status === 200, 'Numbers endpoint returns 200');
            this.assert(!!response.data.numbers, 'Response has numbers array');
        } catch (error) {
            this.assert(false, 'Numbers endpoint accessible', error.message);
        }
    }

    // Generate HTML Report
    generateHTMLReport() {
        const total = this.results.passed + this.results.failed + this.results.skipped;
        const passRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
        const duration = (this.results.endTime - this.results.startTime) / 1000;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VOIP SaaS Backend Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .header p { opacity: 0.9; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            padding: 2rem;
            background: #f8fafc;
        }
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-card h3 { font-size: 2rem; margin-bottom: 0.5rem; }
        .stat-card p { color: #64748b; font-size: 0.875rem; }
        .stat-card.pass h3 { color: #10b981; }
        .stat-card.fail h3 { color: #ef4444; }
        .stat-card.skip h3 { color: #f59e0b; }
        .stat-card.total h3 { color: #3b82f6; }
        .tests {
            padding: 2rem;
        }
        .test-group {
            margin-bottom: 2rem;
        }
        .test-group h2 {
            font-size: 1.25rem;
            margin-bottom: 1rem;
            color: #1e293b;
        }
        .test-item {
            display: flex;
            align-items: center;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            border-left: 4px solid #e2e8f0;
        }
        .test-item.pass { border-left-color: #10b981; }
        .test-item.fail { border-left-color: #ef4444; }
        .test-item.skip { border-left-color: #f59e0b; }
        .test-icon {
            font-size: 1.5rem;
            margin-right: 1rem;
        }
        .test-name {
            flex: 1;
            font-weight: 500;
        }
        .test-error {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        .footer {
            padding: 2rem;
            text-align: center;
            background: #f8fafc;
            color: #64748b;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 VOIP SaaS Backend Test Report</h1>
            <p>Generated on ${this.results.endTime.toISOString()}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card total">
                <h3>${total}</h3>
                <p>Total Tests</p>
            </div>
            <div class="stat-card pass">
                <h3>${this.results.passed}</h3>
                <p>Passed</p>
            </div>
            <div class="stat-card fail">
                <h3>${this.results.failed}</h3>
                <p>Failed</p>
            </div>
            <div class="stat-card skip">
                <h3>${this.results.skipped}</h3>
                <p>Skipped</p>
            </div>
            <div class="stat-card">
                <h3>${passRate}%</h3>
                <p>Pass Rate</p>
            </div>
            <div class="stat-card">
                <h3>${duration.toFixed(2)}s</h3>
                <p>Duration</p>
            </div>
        </div>
        
        <div class="tests">
            <div class="test-group">
                <h2>Test Results</h2>
                ${this.results.tests.map(test => `
                    <div class="test-item ${test.status.toLowerCase()}">
                        <div class="test-icon">${test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⏭️'}</div>
                        <div>
                            <div class="test-name">${test.name}</div>
                            ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="footer">
            <p>VOIP SaaS Platform v4.0.0 | Backend Test Suite</p>
            <p>Report ID: TEST-${Date.now()}</p>
        </div>
    </div>
</body>
</html>
        `;

        return html;
    }

    // Run all tests
    async runAll() {
        this.log('Starting VOIP SaaS Backend Test Suite', 'INFO');
        this.log('='.repeat(60), 'INFO');

        await this.testHealthCheck();
        await this.testAuthentication();
        await this.testAuthMe();
        await this.testBillingEndpoints();
        await this.testAdminEndpoints();
        await this.testAuthorization();
        await this.testNumbersEndpoint();

        this.results.endTime = new Date();
        this.printSummary();
        this.saveReport();
    }

    // Print summary
    printSummary() {
        this.log('='.repeat(60), 'INFO');
        this.log('TEST SUMMARY', 'INFO');
        this.log('='.repeat(60), 'INFO');

        const total = this.results.passed + this.results.failed + this.results.skipped;
        const passRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
        const duration = (this.results.endTime - this.results.startTime) / 1000;

        this.log(`Total Tests: ${total}`, 'INFO');
        this.log(`Passed: ${this.results.passed}`, 'PASS');
        this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'FAIL' : 'PASS');
        this.log(`Skipped: ${this.results.skipped}`, 'SKIP');
        this.log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'PASS' : 'WARN');
        this.log(`Duration: ${duration.toFixed(2)}s`, 'INFO');

        if (this.results.failed === 0) {
            this.log('ALL TESTS PASSED!', 'PASS');
        } else {
            this.log('Some tests failed. Review the report.', 'WARN');
        }
    }

    // Save report
    saveReport() {
        const reportDir = path.join(__dirname, 'test-reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const htmlPath = path.join(reportDir, `backend-test-${timestamp}.html`);
        const jsonPath = path.join(reportDir, `backend-test-${timestamp}.json`);

        // Save HTML report
        fs.writeFileSync(htmlPath, this.generateHTMLReport());
        this.log(`HTML report saved: ${htmlPath}`, 'INFO');

        // Save JSON report
        fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));
        this.log(`JSON report saved: ${jsonPath}`, 'INFO');
    }
}

// Run tests
if (require.main === module) {
    const tester = new BackendTester();
    tester.runAll().catch(console.error);
}

module.exports = BackendTester;
