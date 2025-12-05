const express = require('express');
const router = express.Router();
const { client } = require('../config/twilio');

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 environment:
 *                   type: string
 *                 counts:
 *                   type: object
 *                   properties:
 *                     calls:
 *                       type: integer
 *                     messages:
 *                       type: integer
 *                     numbers:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req, res) => {
    try {
        // Fetch counts from Twilio (limited to recent history for performance)
        // Note: In a real app with a DB, we would query the DB instead.

        const [calls, messages, numbers] = await Promise.all([
            client.calls.list({ limit: 1 }), // Just to get the idea, Twilio API doesn't give total count easily without iterating
            client.messages.list({ limit: 1 }),
            client.incomingPhoneNumbers.list({ limit: 1000 }) // This one we can count reasonably well
        ]);

        // For calls and messages, Twilio API pagination makes getting exact total counts expensive/slow.
        // We would typically store these in our own DB. 
        // For this demo, we'll just return the count of owned numbers and system info.

        res.json({
            success: true,
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            counts: {
                ownedNumbers: numbers.length,
                // These are just placeholders as fetching all history is expensive
                recentCallsChecked: calls.length,
                recentMessagesChecked: messages.length
            },
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                memoryUsage: process.memoryUsage()
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
