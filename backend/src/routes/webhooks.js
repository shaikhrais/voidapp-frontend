const express = require('express');
const router = express.Router();
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const MessagingResponse = require('twilio').twiml.MessagingResponse;

/**
 * @swagger
 * /webhooks/voice:
 *   post:
 *     summary: Voice webhook - handles incoming calls
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: TwiML response
 */
router.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  // Get caller information
  const { From, To, CallSid } = req.body;
  console.log(`Incoming call from ${From} to ${To}, CallSid: ${CallSid}`);

  // Customize this message for your business
  twiml.say({
    voice: 'alice',
    language: 'en-US'
  }, 'Welcome to our VOIP service. Please hold while we connect you to an agent.');

  // You can add more actions:
  // - Play hold music
  twiml.play('http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');

  // - Gather input for IVR menu
  // const gather = twiml.gather({
  //   numDigits: 1,
  //   action: '/webhooks/gather'
  // });
  // gather.say('Press 1 for sales, press 2 for support.');

  // - Forward to a number
  // twiml.dial('+1234567890');

  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * @swagger
 * /webhooks/gather:
 *   post:
 *     summary: IVR menu handler
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: TwiML response
 */
router.post('/gather', (req, res) => {
  const twiml = new VoiceResponse();
  const { Digits } = req.body;

  switch (Digits) {
    case '1':
      twiml.say('Connecting you to sales.');
      twiml.dial('+1234567890'); // Replace with actual sales number
      break;
    case '2':
      twiml.say('Connecting you to support.');
      twiml.dial('+0987654321'); // Replace with actual support number
      break;
    default:
      twiml.say('Invalid selection. Goodbye.');
      twiml.hangup();
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * @swagger
 * /webhooks/call-status:
 *   post:
 *     summary: Call status webhook
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/call-status', (req, res) => {
  const { CallSid, CallStatus, From, To, Duration } = req.body;

  console.log('Call Status Update:', {
    callSid: CallSid,
    status: CallStatus,
    from: From,
    to: To,
    duration: Duration
  });

  // Here you can:
  // - Log to database
  // - Send notifications
  // - Update analytics
  // - Trigger billing events

  res.sendStatus(200);
});

/**
 * @swagger
 * /webhooks/sms:
 *   post:
 *     summary: SMS webhook - handles incoming messages
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: TwiML response
 */
router.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();
  const { From, Body, MessageSid } = req.body;

  console.log(`Incoming SMS from ${From}: ${Body}, MessageSid: ${MessageSid}`);

  // Auto-reply example
  twiml.message('Thank you for your message. Our team will respond shortly.');

  // You can add custom logic here:
  // - Keyword-based responses
  // - Database lookups
  // - Forward to support system

  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * @swagger
 * /webhooks/sms-status:
 *   post:
 *     summary: SMS status webhook
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/sms-status', (req, res) => {
  const { MessageSid, MessageStatus, To, From } = req.body;

  console.log('SMS Status Update:', {
    messageSid: MessageSid,
    status: MessageStatus,
    to: To,
    from: From
  });

  // Log status updates (sent, delivered, failed, etc.)

  res.sendStatus(200);
});

/**
 * @swagger
 * /webhooks/number-status:
 *   post:
 *     summary: Phone number status webhook
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/number-status', (req, res) => {
  const { PhoneNumberSid, Status } = req.body;

  console.log('Number Status Update:', {
    numberSid: PhoneNumberSid,
    status: Status
  });

  res.sendStatus(200);
});

/**
 * @swagger
 * /webhooks/recording-status:
 *   post:
 *     summary: Recording status callback
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/recording-status', (req, res) => {
  const { RecordingSid, RecordingUrl, RecordingStatus, CallSid } = req.body;

  console.log('Recording Status Update:', {
    recordingSid: RecordingSid,
    recordingUrl: RecordingUrl,
    status: RecordingStatus,
    callSid: CallSid
  });

  // Here you can:
  // - Download and store recordings
  // - Transcribe audio
  // - Trigger compliance workflows

  res.sendStatus(200);
});

module.exports = router;
