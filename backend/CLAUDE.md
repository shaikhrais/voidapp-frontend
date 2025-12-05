# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VOIPapp - A complete VOIP service API built with Node.js, Express, and Twilio. Enables building a telephony business with voice calls, SMS messaging, phone number management, and call recording.

## Commands

### Development
```bash
npm install              # Install dependencies
npm run dev             # Start development server with auto-reload (nodemon)
npm start               # Start production server
```

### Testing
```bash
npm test                # Run all tests with coverage
npm run test:watch      # Run tests in watch mode
```

### Setup
1. Copy `.env.example` to `.env`
2. Add Twilio credentials (Account SID, Auth Token, Phone Number)
3. Set `WEBHOOK_BASE_URL` to your public URL (use ngrok for local development)
4. Run `npm install`

## Architecture

### API Structure
- **Express Server** ([src/server.js](src/server.js)) - Main application with middleware (CORS, Helmet, rate limiting)
- **Twilio Client** ([src/config/twilio.js](src/config/twilio.js)) - Centralized Twilio SDK configuration

### Route Modules
- **Calls** ([src/routes/calls.js](src/routes/calls.js)) - Outbound calls, call status, recordings
- **SMS** ([src/routes/sms.js](src/routes/sms.js)) - Send/receive SMS, MMS support
- **Numbers** ([src/routes/numbers.js](src/routes/numbers.js)) - Search, purchase, configure phone numbers
- **Webhooks** ([src/routes/webhooks.js](src/routes/webhooks.js)) - Handle Twilio callbacks (voice, SMS, status updates)

### Key Endpoints
- `POST /api/calls/outbound` - Make calls
- `POST /api/sms/send` - Send SMS
- `GET /api/numbers/available/:countryCode` - Search available numbers
- `POST /api/numbers/purchase` - Buy phone numbers
- `POST /webhooks/voice` - Handle incoming calls (TwiML)
- `POST /webhooks/sms` - Handle incoming SMS (TwiML)

### Webhook Configuration
Webhooks require a publicly accessible URL. For local development:
- Use ngrok: `ngrok http 3000`
- Update `WEBHOOK_BASE_URL` in `.env`
- Twilio will POST to `/webhooks/*` endpoints

## Safe Development Strategy

This project follows a safe migration approach for dynamic content:

### Branch Strategy (GitFlow)
- `master`: production-ready code
- `develop`: integration branch
- `feature/*`: individual features
- `hotfix/*`: emergency fixes

### Migration Phases
1. Non-critical components (FAQ, features)
2. User-facing content (navigation, messages)
3. Core functionality (products, contacts, tasks)
4. Authentication and admin features

### Error Handling
- Fallback to static content on dynamic errors
- Comprehensive error logging
- Automated alerts for critical failures
