const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { client, phoneNumber } = require('../config/twilio');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Organization = require('../models/Organization');

/**
 * @swagger
 * /api/sms/send:
 *   post:
 *     summary: Send an SMS
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *                 description: The phone number to send to
 *               message:
 *                 type: string
 *                 description: The message body
 *               mediaUrl:
 *                 type: string
 *                 description: Optional media URL for MMS
 *     responses:
 *       200:
 *         description: SMS sent successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/send', auth,
  [
    body('to').isMobilePhone().withMessage('Valid phone number required'),
    body('message').notEmpty().withMessage('Message is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { to, message, mediaUrl } = req.body;

      // Check Credits
      if (req.user.organizationId) {
        const org = await Organization.findByPk(req.user.organizationId);
        if (!org || org.credits < 0.1) { // Assuming $0.10 min for SMS
          return res.status(403).json({ error: 'Insufficient credits. Please top up.' });
        }
      }

      const messageOptions = {
        body: message,
        from: phoneNumber,
        to: to,
        statusCallback: `${process.env.WEBHOOK_BASE_URL}/webhooks/sms-status`
      };

      if (mediaUrl) {
        messageOptions.mediaUrl = [mediaUrl];
      }

      const sentMessage = await client.messages.create(messageOptions);

      // Save to local database
      if (req.user.organizationId) {
        await Message.create({
          sid: sentMessage.sid,
          to: to,
          from: phoneNumber,
          body: message,
          status: sentMessage.status,
          organizationId: req.user.organizationId
        });
      }

      res.json({
        success: true,
        messageSid: sentMessage.sid,
        status: sentMessage.status,
        to: sentMessage.to,
        from: sentMessage.from,
        body: sentMessage.body
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/sms/{messageSid}:
 *   get:
 *     summary: Get message details
 *     tags: [SMS]
 *     parameters:
 *       - in: path
 *         name: messageSid
 *         schema:
 *           type: string
 *         required: true
 *         description: The Message SID
 *     responses:
 *       200:
 *         description: Message details
 *       500:
 *         description: Server error
 */
router.get('/:messageSid', async (req, res) => {
  try {
    const { messageSid } = req.params;
    const message = await client.messages(messageSid).fetch();

    res.json({
      success: true,
      message: {
        sid: message.sid,
        status: message.status,
        from: message.from,
        to: message.to,
        body: message.body,
        numSegments: message.numSegments,
        price: message.price,
        priceUnit: message.priceUnit,
        direction: message.direction,
        dateSent: message.dateSent,
        dateCreated: message.dateCreated
      }
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/sms:
 *   get:
 *     summary: List messages
 *     tags: [SMS]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max number of results
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: Filter by To number
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: Filter by From number
 *     responses:
 *       200:
 *         description: List of messages
 *       500:
 *         description: Server error
 */
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.organizationId) {
      return res.status(400).json({ error: 'User does not belong to an organization' });
    }

    const { limit = 20, to, from } = req.query;

    const options = {
      where: { organizationId: req.user.organizationId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    };

    if (to) options.where.to = to;
    if (from) options.where.from = from;

    const messages = await Message.findAll(options);

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Error listing messages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/sms/{messageSid}:
 *   delete:
 *     summary: Delete a message
 *     tags: [SMS]
 *     parameters:
 *       - in: path
 *         name: messageSid
 *         schema:
 *           type: string
 *         required: true
 *         description: The Message SID
 *     responses:
 *       200:
 *         description: Message deleted
 *       500:
 *         description: Server error
 */
router.delete('/:messageSid', async (req, res) => {
  try {
    const { messageSid } = req.params;
    await client.messages(messageSid).remove();

    res.json({
      success: true,
      message: 'Message deleted',
      messageSid: messageSid
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
