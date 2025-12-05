# VOIP Service API

A comprehensive VOIP service API built with Node.js, Express, and Twilio. This API enables you to build a complete telephony business with features like voice calls, SMS messaging, phone number management, and call recording.

## Features

- **Voice Calls**
  - Make outbound calls
  - Receive inbound calls
  - Call status tracking
  - Call recording
  - Interactive Voice Response (IVR)

- **SMS Messaging**
  - Send SMS messages
  - Receive SMS messages
  - Message status tracking
  - MMS support

- **Phone Number Management**
  - Search available numbers
  - Purchase phone numbers
  - Configure number settings
  - Release numbers

- **Webhooks**
  - Voice call handling
  - SMS message handling
  - Status callbacks
  - Recording callbacks

## Prerequisites

- Node.js (v14 or higher)
- Twilio account with:
  - Account SID
  - Auth Token
  - At least one phone number

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your `.env` file with your Twilio credentials:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
PORT=3000
WEBHOOK_BASE_URL=https://your-domain.com
```

## Running the Application

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Voice Calls

- `POST /api/calls/outbound` - Make an outbound call
  - Body: `{ "to": "+1234567890", "message": "optional" }`

- `GET /api/calls` - List all calls
  - Query params: `?limit=20&status=completed`

- `GET /api/calls/:callSid` - Get call details

- `POST /api/calls/:callSid/end` - End an active call

- `GET /api/calls/:callSid/recordings` - Get call recordings

### SMS Messaging

- `POST /api/sms/send` - Send an SMS
  - Body: `{ "to": "+1234567890", "message": "Hello!", "mediaUrl": "optional" }`

- `GET /api/sms` - List all messages
  - Query params: `?limit=20&to=+1234567890`

- `GET /api/sms/:messageSid` - Get message details

- `DELETE /api/sms/:messageSid` - Delete a message

### Phone Numbers

- `GET /api/numbers/available/:countryCode` - Search available numbers
  - Example: `/api/numbers/available/US?areaCode=415&limit=10`

- `POST /api/numbers/purchase` - Purchase a phone number
  - Body: `{ "phoneNumber": "+1234567890", "friendlyName": "Main Line" }`

- `GET /api/numbers` - List owned phone numbers

- `GET /api/numbers/:numberSid` - Get number details

- `PUT /api/numbers/:numberSid` - Update number configuration
  - Body: `{ "friendlyName": "New Name", "voiceUrl": "https://..." }`

- `DELETE /api/numbers/:numberSid` - Release a phone number

### Webhooks

- `POST /webhooks/voice` - Handle incoming calls
- `POST /webhooks/sms` - Handle incoming SMS
- `POST /webhooks/call-status` - Call status updates
- `POST /webhooks/sms-status` - SMS status updates
- `POST /webhooks/recording-status` - Recording status updates

## Webhook Configuration

For webhooks to work, you need a publicly accessible URL. During development, you can use:

- [ngrok](https://ngrok.com/): `ngrok http 3000`
- [localtunnel](https://localtunnel.github.io/www/): `lt --port 3000`

Update your `.env` file with the public URL:
```
WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok.io
```

## Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Security

- API rate limiting enabled (100 requests per 15 minutes by default)
- Helmet.js for security headers
- Input validation on all endpoints
- Environment variables for sensitive data

## Error Handling

All endpoints return JSON responses:

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Cost Considerations

Be aware of Twilio pricing:
- Voice calls: ~$0.013/minute
- SMS: ~$0.0075/message
- Phone numbers: ~$1/month

Monitor usage in your Twilio console.

## License

ISC
