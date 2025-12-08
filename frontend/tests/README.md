# Frontend Tests

## Quick Start

```bash
cd frontend/tests
npm install
npm test
```

## What It Tests

✅ Page load and rendering  
✅ Login page elements  
✅ Login flow (authentication)  
✅ Dashboard elements  
✅ Role-based menu items  
✅ Navigation between pages  
✅ Logout functionality  

## Features

- **Automated E2E Testing** with Puppeteer
- **Screenshots** of each test step
- **HTML Reports** with visual results
- **JSON Reports** for CI/CD integration

## Test Reports

Reports saved to: `frontend/tests/test-reports/`

- HTML report with screenshots
- JSON report with detailed results
- Pass/fail statistics
- Execution time

## Run Tests

```bash
# Run once
npm test

# Watch mode
npm run test:watch
```

## Test Coverage

- 21 automated tests
- 7 test groups
- Screenshots for visual verification
- Full E2E flow testing
