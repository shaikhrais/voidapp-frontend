const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { client, phoneNumber } = require('../config/twilio');
const auth = require('../middleware/auth');
const Call = require('../models/Call');
const Organization = require('../models/Organization');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

/**
 * @swagger
 * /api/calls/outbound:
 *   post:
 *     summary: Make an outbound call
 *     tags: [Calls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 description: The phone number to call
 *               message:
 *                 type: string
 *                 description: Optional message to play
 *     responses:
 *       200:
 *         description: Call initiated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/outbound', auth,
  [
    body('to').isMobilePhone().withMessage('Valid phone number required'),
    body('message').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { to, message } = req.body;

      // Check Credits
      if (req.user.organizationId) {
        const org = await Organization.findByPk(req.user.organizationId);
        if (!org || org.credits < 1.0) { // Assuming $1.00 min for a call
          return res.status(403).json({ error: 'Insufficient credits. Please top up.' });
        }
      }

      const webhookUrl = `${process.env.WEBHOOK_BASE_URL}/webhooks/voice`;

      const call = await client.calls.create({
        to: to,
        from: phoneNumber,
        url: webhookUrl,
        statusCallback: `${process.env.WEBHOOK_BASE_URL}/webhooks/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true
      });

      // Save to local database
      if (req.user.organizationId) {
        await Call.create({
          sid: call.sid,
          to: to,
          from: phoneNumber,
          status: call.status,
          organizationId: req.user.organizationId
        });
      }

      res.json({
        success: true,
        callSid: call.sid,
        status: call.status,
        to: call.to,
        from: call.from
      });
    } catch (error) {
      console.error('Error making call:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/calls/{callSid}:
 *   get:
 *     summary: Get call details
 *     tags: [Calls]
 *     parameters:
 *       - in: path
 *         name: callSid
 *         schema:
 *           type: string
 *         required: true
 *         description: The Call SID
 *     responses:
 *       200:
 *         description: Call details
 *       500:
 *         description: Server error
 */
router.get('/:callSid', async (req, res) => {
  try {
    const { callSid } = req.params;
    const call = await client.calls(callSid).fetch();

    res.json({
      success: true,
      call: {
        sid: call.sid,
        status: call.status,
        duration: call.duration,
        from: call.from,
        to: call.to,
        price: call.price,
        priceUnit: call.priceUnit,
        direction: call.direction,
        startTime: call.startTime,
        endTime: call.endTime
      }
    });
  } catch (error) {
    console.error('Error fetching call:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/calls:
 *   get:
 *     summary: List all calls
 *     tags: [Calls]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max number of results
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of calls
 *       500:
 *         description: Server error
 */
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.organizationId) {
      return res.status(400).json({ error: 'User does not belong to an organization' });
    }

    const { limit = 20, status } = req.query;

    const options = {
      where: { organizationId: req.user.organizationId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    };

    if (status) {
      options.where.status = status;
    }

    const calls = await Call.findAll(options);

    res.json({
      success: true,
      count: calls.length,
      calls
    });
  } catch (error) {
    console.error('Error listing calls:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/calls/{callSid}/end:
 *   post:
 *     summary: End a call
 *     tags: [Calls]
 *     parameters:
 *       - in: path
 *         name: callSid
 *         schema:
 *           type: string
 *         required: true
 *         description: The Call SID
 *     responses:
 *       200:
 *         description: Call ended successfully
 *       500:
 *         description: Server error
 */
router.post('/:callSid/end', async (req, res) => {
  try {
    const { callSid } = req.params;
    const call = await client.calls(callSid).update({ status: 'completed' });

    res.json({
      success: true,
      message: 'Call ended',
      callSid: call.sid,
      status: call.status
    });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/calls/{callSid}/recordings:
 *   get:
 *     summary: Get call recordings
 *     tags: [Calls]
 *     parameters:
 *       - in: path
 *         name: callSid
 *         schema:
 *           type: string
 *         required: true
 *         description: The Call SID
 *     responses:
 *       200:
 *         description: List of recordings
 *       500:
 *         description: Server error
 */
router.get('/:callSid/recordings', async (req, res) => {
  try {
    const { callSid } = req.params;
    const recordings = await client.recordings.list({ callSid: callSid });

    res.json({
      success: true,
      count: recordings.length,
      recordings: recordings.map(recording => ({
        sid: recording.sid,
        duration: recording.duration,
        price: recording.price,
        uri: recording.uri,
        url: `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`
      }))
    });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
