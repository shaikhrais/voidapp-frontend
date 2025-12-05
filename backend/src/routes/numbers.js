const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { client } = require('../config/twilio');
const auth = require('../middleware/auth');
const PhoneNumber = require('../models/PhoneNumber');

/**
 * @swagger
 * /api/numbers/available/{countryCode}:
 *   get:
 *     summary: Search available phone numbers
 *     tags: [Numbers]
 *     parameters:
 *       - in: path
 *         name: countryCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Country code (e.g., US)
 *       - in: query
 *         name: areaCode
 *         schema:
 *           type: string
 *         description: Filter by area code
 *       - in: query
 *         name: contains
 *         schema:
 *           type: string
 *         description: Filter by number pattern
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max number of results
 *     responses:
 *       200:
 *         description: List of available numbers
 *       500:
 *         description: Server error
 */
router.get('/available/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { areaCode, contains, limit = 10 } = req.query;

    const searchOptions = { limit: parseInt(limit) };
    if (areaCode) searchOptions.areaCode = areaCode;
    if (contains) searchOptions.contains = contains;

    const numbers = await client.availablePhoneNumbers(countryCode)
      .local
      .list(searchOptions);

    res.json({
      success: true,
      count: numbers.length,
      numbers: numbers.map(num => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality,
        region: num.region,
        postalCode: num.postalCode,
        capabilities: num.capabilities
      }))
    });
  } catch (error) {
    console.error('Error searching numbers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/numbers/purchase:
 *   post:
 *     summary: Purchase a phone number
 *     tags: [Numbers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number to purchase
 *               friendlyName:
 *                 type: string
 *                 description: Friendly name for the number
 *     responses:
 *       200:
 *         description: Number purchased successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/purchase', auth,
  [
    body('phoneNumber').isMobilePhone().withMessage('Valid phone number required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phoneNumber, friendlyName } = req.body;

      const purchasedNumber = await client.incomingPhoneNumbers.create({
        phoneNumber: phoneNumber,
        friendlyName: friendlyName || phoneNumber,
        voiceUrl: `${process.env.WEBHOOK_BASE_URL}/webhooks/voice`,
        smsUrl: `${process.env.WEBHOOK_BASE_URL}/webhooks/sms`,
        statusCallback: `${process.env.WEBHOOK_BASE_URL}/webhooks/number-status`
      });

      // Save to local database linked to Organization
      if (req.user.organizationId) {
        await PhoneNumber.create({
          phoneNumber: purchasedNumber.phoneNumber,
          sid: purchasedNumber.sid,
          friendlyName: friendlyName || purchasedNumber.friendlyName,
          organizationId: req.user.organizationId
        });
      }

      res.json({
        success: true,
        number: {
          sid: purchasedNumber.sid,
          phoneNumber: purchasedNumber.phoneNumber,
          friendlyName: purchasedNumber.friendlyName,
          capabilities: purchasedNumber.capabilities
        }
      });
    } catch (error) {
      console.error('Error purchasing number:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/numbers:
 *   get:
 *     summary: List owned phone numbers
 *     tags: [Numbers]
 *     responses:
 *       200:
 *         description: List of owned numbers
 *       500:
 *         description: Server error
 */
router.get('/', auth, async (req, res) => {
  try {
    // List numbers from local DB for this organization
    if (!req.user.organizationId) {
      return res.status(400).json({ error: 'User does not belong to an organization' });
    }

    const numbers = await PhoneNumber.findAll({
      where: { organizationId: req.user.organizationId }
    });

    // Optional: Sync with Twilio if needed, but for now return local view

    res.json({
      success: true,
      count: numbers.length,
      numbers: numbers.map(num => ({
        sid: num.sid,
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        // Capabilities/URLs might need to be fetched from Twilio or stored locally
        // For now, returning basic info stored in DB
      }))
    });
  } catch (error) {
    console.error('Error listing numbers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/numbers/{numberSid}:
 *   get:
 *     summary: Get specific number details
 *     tags: [Numbers]
 *     parameters:
 *       - in: path
 *         name: numberSid
 *         schema:
 *           type: string
 *         required: true
 *         description: The Number SID
 *     responses:
 *       200:
 *         description: Number details
 *       500:
 *         description: Server error
 */
router.get('/:numberSid', auth, async (req, res) => {
  try {
    const { numberSid } = req.params;

    // Check ownership
    const localNumber = await PhoneNumber.findOne({
      where: { sid: numberSid, organizationId: req.user.organizationId }
    });

    if (!localNumber) {
      return res.status(404).json({ error: 'Number not found or access denied' });
    }

    const number = await client.incomingPhoneNumbers(numberSid).fetch();

    res.json({
      success: true,
      number: {
        sid: number.sid,
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName,
        capabilities: number.capabilities,
        voiceUrl: number.voiceUrl,
        smsUrl: number.smsUrl,
        statusCallback: number.statusCallback,
        dateCreated: number.dateCreated
      }
    });
  } catch (error) {
    console.error('Error fetching number:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/numbers/{numberSid}:
 *   put:
 *     summary: Update phone number configuration
 *     tags: [Numbers]
 *     parameters:
 *       - in: path
 *         name: numberSid
 *         schema:
 *           type: string
 *         required: true
 *         description: The Number SID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendlyName:
 *                 type: string
 *               voiceUrl:
 *                 type: string
 *               smsUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Number updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { numberSid } = req.params;

    // Check ownership
    const localNumber = await PhoneNumber.findOne({
      where: { sid: numberSid, organizationId: req.user.organizationId }
    });

    if (!localNumber) {
      return res.status(404).json({ error: 'Number not found or access denied' });
    }

    const { friendlyName, voiceUrl, smsUrl } = req.body;

    const updateOptions = {};
    if (friendlyName) updateOptions.friendlyName = friendlyName;
    if (voiceUrl) updateOptions.voiceUrl = voiceUrl;
    if (smsUrl) updateOptions.smsUrl = smsUrl;

    const updatedNumber = await client.incomingPhoneNumbers(numberSid)
      .update(updateOptions);

    res.json({
      success: true,
      message: 'Number updated successfully',
      number: {
        sid: updatedNumber.sid,
        phoneNumber: updatedNumber.phoneNumber,
        friendlyName: updatedNumber.friendlyName,
        voiceUrl: updatedNumber.voiceUrl,
        smsUrl: updatedNumber.smsUrl
      }
    });
  } catch (error) {
    console.error('Error updating number:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
);

/**
 * @swagger
 * /api/numbers/{numberSid}:
 *   delete:
 *     summary: Release/delete a phone number
 *     tags: [Numbers]
 *     parameters:
 *       - in: path
 *         name: numberSid
 *         schema:
 *           type: string
 *         required: true
 *         description: The Number SID
 *     responses:
 *       200:
 *         description: Phone number released
 *       500:
 *         description: Server error
 */
router.delete('/:numberSid', auth, async (req, res) => {
  try {
    const { numberSid } = req.params;

    // Check ownership
    const localNumber = await PhoneNumber.findOne({
      where: { sid: numberSid, organizationId: req.user.organizationId }
    });

    if (!localNumber) {
      return res.status(404).json({ error: 'Number not found or access denied' });
    }

    // Remove from Twilio
    await client.incomingPhoneNumbers(numberSid).remove();

    // Remove from local DB
    await localNumber.destroy();

    res.json({
      success: true,
      message: 'Phone number released',
      numberSid: numberSid
    });
  } catch (error) {
    console.error('Error releasing number:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
