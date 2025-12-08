# Voice Module Architecture

## Overview
The voice system is now modular and scalable, with each feature in its own module.

## Module Structure

```
backend/src/modules/voice/
├── tokenGenerator.js      - Twilio Voice SDK token generation
├── twimlGenerator.js      - TwiML generation for all scenarios
├── callHandler.js         - Call initiation and management
├── recordingManager.js    - Call recording (future)
├── voicemailManager.js    - Voicemail handling (future)
├── ivrManager.js          - IVR menu system (future)
├── queueManager.js        - Call queue management (future)
└── forwardingManager.js   - Call forwarding rules (future)
```

## Current Modules

### 1. Token Generator (`tokenGenerator.js`)
**Purpose:** Generate Twilio Voice SDK tokens for users

**Methods:**
- `generateToken(userEmail)` - Create JWT token for Twilio Voice

**Usage:**
```javascript
const tokenGen = createTokenGenerator(env);
const { token, identity } = await tokenGen.generateToken('user@example.com');
```

---

### 2. TwiML Generator (`twimlGenerator.js`)
**Purpose:** Generate TwiML responses for different call scenarios

**Methods:**
- `generateOutboundCall(to, from, options)` - Basic outbound call
- `generateVoicemail(greetingText, recordingUrl)` - Voicemail TwiML
- `generateIVRMenu(menuText, menuOptions, timeout)` - IVR menu
- `generateCallForward(destinations, ringStrategy)` - Call forwarding
- `generateError(message)` - Error response
- `generateCallQueue(queueName, waitUrl)` - Call queue

**Usage:**
```javascript
const twimlGen = createTwiMLGenerator(env);
const twiml = twimlGen.generateOutboundCall('+1234567890', '+0987654321', {
    record: true,
    recordingCallback: 'https://example.com/recording'
});
```

---

### 3. Call Handler (`callHandler.js`)
**Purpose:** Handle call initiation and management

**Methods:**
- `initiateCall(userId, to, from)` - Start outbound call
- `updateCallStatus(callSid, status, duration)` - Update call status
- `getCallDetails(callSid)` - Get call information
- `getActiveCalls(organizationId)` - Get active calls

**Usage:**
```javascript
const callHandler = createCallHandler(db, twilioClient);
const result = await callHandler.initiateCall(userId, '+1234567890', '+0987654321');
```

---

## Main Router (`routes/voice.js`)

The main router is now **very small** and delegates to modules:

```javascript
// Token generation
voice.get('/token', async (c) => {
    const tokenGen = createTokenGenerator(c.env);
    return c.json(await tokenGen.generateToken(user.email));
});

// Call initiation
voice.post('/call', async (c) => {
    const callHandler = createCallHandler(c.env.DB, null);
    return c.json(await callHandler.initiateCall(user.id, to, from));
});

// TwiML generation
voice.post('/twiml', async (c) => {
    const twimlGen = createTwiMLGenerator(c.env);
    return c.text(twimlGen.generateOutboundCall(To, From, options));
});
```

---

## Future Modules (Ready to Add)

### Recording Manager
```javascript
// backend/src/modules/voice/recordingManager.js
export class RecordingManager {
    async storeRecording(callId, recordingSid, url) { }
    async getRecordings(callId) { }
    async deleteRecording(recordingId) { }
}
```

### Voicemail Manager
```javascript
// backend/src/modules/voice/voicemailManager.js
export class VoicemailManager {
    async createVoicemail(phoneNumberId, fromNumber, recordingUrl) { }
    async getVoicemails(phoneNumberId) { }
    async markAsRead(voicemailId) { }
}
```

### IVR Manager
```javascript
// backend/src/modules/voice/ivrManager.js
export class IVRManager {
    async getMenu(menuId) { }
    async handleInput(menuId, digit) { }
    async createMenu(organizationId, menuData) { }
}
```

### Queue Manager
```javascript
// backend/src/modules/voice/queueManager.js
export class QueueManager {
    async addToQueue(queueId, callSid) { }
    async getQueuePosition(callSid) { }
    async dequeue(queueId) { }
}
```

---

## Benefits

### ✅ Small Files
- Each module is <200 lines
- Easy to understand and maintain
- Single responsibility principle

### ✅ Scalable
- Add new features by creating new modules
- No need to modify existing code
- Easy to test individual modules

### ✅ Flexible
- Modules can be used independently
- Easy to swap implementations
- Clean interfaces

### ✅ Maintainable
- Clear separation of concerns
- Easy to find and fix bugs
- Simple to add new developers

---

## Adding New Features

### Example: Adding Call Recording

1. **Create Module:**
```javascript
// backend/src/modules/voice/recordingManager.js
export class RecordingManager {
    // Implementation
}
```

2. **Import in Router:**
```javascript
import { createRecordingManager } from '../../modules/voice/recordingManager.js';
```

3. **Add Route:**
```javascript
voice.post('/recording-status', async (c) => {
    const recordingMgr = createRecordingManager(c.env.DB);
    await recordingMgr.storeRecording(callId, recordingSid, url);
    return c.text('OK');
});
```

**That's it!** No need to modify existing code.

---

## File Size Comparison

### Before Refactoring:
- `voice.js`: 240 lines (monolithic)

### After Refactoring:
- `voice.js`: 180 lines (router only)
- `tokenGenerator.js`: 90 lines
- `twimlGenerator.js`: 130 lines
- `callHandler.js`: 90 lines

**Total:** Same functionality, but organized and scalable!

---

## Next Steps

1. ✅ Token generation module
2. ✅ TwiML generation module
3. ✅ Call handler module
4. 🔨 Recording manager module
5. 🔨 Voicemail manager module
6. 🔨 IVR manager module
7. 🔨 Queue manager module

**The architecture is ready for all future features!** 🚀
