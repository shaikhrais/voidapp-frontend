const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * VOIP SaaS Frontend Test Suite
 * Automated E2E testing using Puppeteer
 */

class FrontendTester {
    constructor() {
        this.baseURL = process.env.FRONTEND_URL || 'https://main.voipapp-frontend.pages.dev';
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            screenshots: [],
            startTime: new Date(),
            endTime: null
        };
        this.browser = null;
        this.page = null;
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

    // Utility: Take screenshot
    async screenshot(name) {
        const screenshotDir = path.join(__dirname, 'test-reports', 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        const filename = `${name}-${Date.now()}.png`;
        const filepath = path.join(screenshotDir, filename);
        await this.page.screenshot({ path: filepath, fullPage: true });
        this.results.screenshots.push(filepath);
        this.log(`Screenshot saved: ${filename}`, 'INFO');
        return filepath;
    }

    // Setup browser
    async setup() {
        this.log('Launching browser...', 'INFO');
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });
    }

    // Teardown browser
    async teardown() {
        if (this.browser) {
            await this.browser.close();
            this.log('Browser closed', 'INFO');
        }
    }

    // Test 1: Page Load
    async testPageLoad() {
        this.log('Test Group 1: Page Load', 'INFO');

        try {
            await this.page.goto(this.baseURL, { waitUntil: 'networkidle2', timeout: 30000 });
            this.assert(true, 'Frontend page loads successfully');

            const title = await this.page.title();
            this.assert(!!title, 'Page has title', !title ? 'No title found' : '');
            this.log(`Page title: ${title}`, 'INFO');

            await this.screenshot('page-load');
        } catch (error) {
            this.assert(false, 'Frontend page loads', error.message);
        }
    }

    // Test 2: Login Page
    async testLoginPage() {
        this.log('Test Group 2: Login Page', 'INFO');

        try {
            // Check if on login page or navigate to it
            const currentUrl = this.page.url();
            if (!currentUrl.includes('/login')) {
                await this.page.goto(`${this.baseURL}/login`, { waitUntil: 'networkidle2' });
            }

            // Check for login form elements
            const emailInput = await this.page.$('input[type="email"], input[name="email"]');
            this.assert(!!emailInput, 'Email input exists');

            const passwordInput = await this.page.$('input[type="password"], input[name="password"]');
            this.assert(!!passwordInput, 'Password input exists');

            const loginButton = await this.page.$('button[type="submit"]');
            this.assert(!!loginButton, 'Login button exists');

            await this.screenshot('login-page');
        } catch (error) {
            this.assert(false, 'Login page elements present', error.message);
        }
    }

    // Test 3: Login Flow
    async testLoginFlow() {
        this.log('Test Group 3: Login Flow', 'INFO');

        try {
            // Fill in login form
            await this.page.type('input[type="email"], input[name="email"]', 'itpro.mohammed@gmail.com');
            await this.page.type('input[type="password"], input[name="password"]', 'Rsoft@999');

            await this.screenshot('login-filled');

            // Click login button
            await Promise.all([
                this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
                this.page.click('button[type="submit"]')
            ]);

            this.assert(true, 'Login form submission successful');

            // Check if redirected to dashboard
            const currentUrl = this.page.url();
            this.assert(
                currentUrl.includes('/dashboard'),
                'Redirected to dashboard after login',
                `Current URL: ${currentUrl}`
            );

            await this.screenshot('post-login');
        } catch (error) {
            this.assert(false, 'Login flow completes', error.message);
        }
    }

    // Test 4: Dashboard Elements
    async testDashboardElements() {
        this.log('Test Group 4: Dashboard Elements', 'INFO');

        try {
            // Wait for dashboard to load
            await this.page.waitForSelector('nav, [role="navigation"]', { timeout: 5000 });

            // Check for navigation
            const nav = await this.page.$('nav, [role="navigation"]');
            this.assert(!!nav, 'Navigation menu exists');

            // Check for menu items
            const menuItems = await this.page.$$('nav a, [role="navigation"] a');
            this.assert(menuItems.length > 0, 'Menu items present', `Found ${menuItems.length} items`);
            this.log(`Found ${menuItems.length} menu items`, 'INFO');

            // Check for role badge
            const pageContent = await this.page.content();
            const hasAdminBadge = pageContent.includes('Admin') || pageContent.includes('admin');
            this.assert(hasAdminBadge, 'Role badge displayed');

            await this.screenshot('dashboard-elements');
        } catch (error) {
            this.assert(false, 'Dashboard elements present', error.message);
        }
    }

    // Test 5: Role-Based Menu Items
    async testRoleBasedMenus() {
        this.log('Test Group 5: Role-Based Menu Items', 'INFO');

        try {
            // Get all menu text
            const menuTexts = await this.page.$$eval('nav a, [role="navigation"] a',
                links => links.map(link => link.textContent.trim())
            );

            this.log(`Menu items: ${menuTexts.join(', ')}`, 'INFO');

            // Check for common items
            const hasSettings = menuTexts.some(text => text.includes('Settings'));
            this.assert(hasSettings, 'Settings menu item exists');

            const hasDashboard = menuTexts.some(text => text.includes('Dashboard'));
            this.assert(hasDashboard, 'Dashboard menu item exists');

            // Check for admin items (since we logged in as super_admin)
            const hasAdminDashboard = menuTexts.some(text => text.includes('Admin Dashboard'));
            this.assert(hasAdminDashboard, 'Admin Dashboard menu item exists (super_admin)');

            const hasAgencies = menuTexts.some(text => text.includes('Agencies'));
            this.assert(hasAgencies, 'Agencies menu item exists (super_admin)');

            const hasTeamManagement = menuTexts.some(text => text.includes('Team'));
            this.assert(hasTeamManagement, 'Team Management menu item exists');

            await this.screenshot('menu-items');
        } catch (error) {
            this.assert(false, 'Role-based menu items present', error.message);
        }
    }

    // Test 6: Navigation
    async testNavigation() {
        this.log('Test Group 6: Navigation', 'INFO');

        try {
            // Navigate to Admin Dashboard
            await this.page.click('a[href*="/dashboard/admin"]');
            await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });

            const adminUrl = this.page.url();
            this.assert(
                adminUrl.includes('/dashboard/admin'),
                'Can navigate to Admin Dashboard',
                `URL: ${adminUrl}`
            );

            await this.screenshot('admin-dashboard');

            // Navigate to Settings
            await this.page.click('a[href*="/settings"]');
            await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });

            const settingsUrl = this.page.url();
            this.assert(
                settingsUrl.includes('/settings'),
                'Can navigate to Settings',
                `URL: ${settingsUrl}`
            );

            await this.screenshot('settings-page');
        } catch (error) {
            this.assert(false, 'Navigation works', error.message);
        }
    }

    // Test 7: Logout
    async testLogout() {
        this.log('Test Group 7: Logout', 'INFO');

        try {
            // Find and click logout button
            const logoutButton = await this.page.$('button:has-text("Logout"), a:has-text("Logout"), [aria-label*="logout" i]');

            if (logoutButton) {
                await logoutButton.click();
                await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });

                const currentUrl = this.page.url();
                this.assert(
                    currentUrl.includes('/login'),
                    'Logout redirects to login page',
                    `URL: ${currentUrl}`
                );

                await this.screenshot('post-logout');
            } else {
                this.assert(false, 'Logout button found', 'Button not found');
            }
        } catch (error) {
            this.assert(false, 'Logout works', error.message);
        }
    }

    // Generate HTML Report
    generateHTMLReport() {
        const total = this.results.passed + this.results.failed + this.results.skipped;
        const passRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
        const duration = (this.results.endTime - this.results.startTime) / 1000;

        const screenshotsHTML = this.results.screenshots.map((path, idx) => `
            <div class="screenshot">
                <img src="${path}" alt="Screenshot ${idx + 1}" />
                <p>Screenshot ${idx + 1}</p>
            </div>
        `).join('');

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VOIP SaaS Frontend Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
        .stat-card.pass h3 { color: #10b981; }
        .stat-card.fail h3 { color: #ef4444; }
        .tests { padding: 2rem; }
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
        .screenshots {
            padding: 2rem;
            background: #f8fafc;
        }
        .screenshots h2 { margin-bottom: 1rem; }
        .screenshot {
            margin-bottom: 1rem;
            text-align: center;
        }
        .screenshot img {
            max-width: 100%;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .footer {
            padding: 2rem;
            text-align: center;
            background: #f8fafc;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 VOIP SaaS Frontend Test Report</h1>
            <p>Generated on ${this.results.endTime.toISOString()}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
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
            <h2>Test Results</h2>
            ${this.results.tests.map(test => `
                <div class="test-item ${test.status.toLowerCase()}">
                    <div style="font-size: 1.5rem; margin-right: 1rem;">
                        ${test.status === 'PASS' ? '✅' : '❌'}
                    </div>
                    <div>
                        <div style="font-weight: 500;">${test.name}</div>
                        ${test.error ? `<div style="color: #ef4444; font-size: 0.875rem;">${test.error}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="screenshots">
            <h2>Screenshots</h2>
            ${screenshotsHTML}
        </div>
        
        <div class="footer">
            <p>VOIP SaaS Platform v4.0.0 | Frontend Test Suite</p>
            <p>Report ID: TEST-FE-${Date.now()}</p>
        </div>
    </div>
</body>
</html>
        `;

        return html;
    }

    // Run all tests
    async runAll() {
        this.log('Starting VOIP SaaS Frontend Test Suite', 'INFO');
        this.log('='.repeat(60), 'INFO');

        try {
            await this.setup();

            await this.testPageLoad();
            await this.testLoginPage();
            await this.testLoginFlow();
            await this.testDashboardElements();
            await this.testRoleBasedMenus();
            await this.testNavigation();
            await this.testLogout();

        } catch (e) {
            this.log(`Test suite error: ${e.message}`, 'FAIL');
        } finally {
            await this.teardown();
        }

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
        this.log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'PASS' : 'WARN');
        this.log(`Duration: ${duration.toFixed(2)}s`, 'INFO');
        this.log(`Screenshots: ${this.results.screenshots.length}`, 'INFO');

        if (this.results.failed === 0) {
            this.log('ALL TESTS PASSED!', 'PASS');
        }
    }

    // Save report
    saveReport() {
        const reportDir = path.join(__dirname, 'test-reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const htmlPath = path.join(reportDir, `frontend-test-${timestamp}.html`);
        const jsonPath = path.join(reportDir, `frontend-test-${timestamp}.json`);

        fs.writeFileSync(htmlPath, this.generateHTMLReport());
        this.log(`HTML report saved: ${htmlPath}`, 'INFO');

        fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));
        this.log(`JSON report saved: ${jsonPath}`, 'INFO');
    }
}

// Run tests
if (require.main === module) {
    const tester = new FrontendTester();
    tester.runAll().catch(console.error);
}

module.exports = FrontendTester;
