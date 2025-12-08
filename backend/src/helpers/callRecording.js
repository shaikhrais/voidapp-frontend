// Call Recording Helper
// Manages call recordings, storage, and retrieval

export class CallRecordingManager {
    constructor(db, twilioClient) {
        this.db = db;
        this.twilioClient = twilioClient;
    }

    /**
     * Check if recording is enabled for organization
     */
    async isRecordingEnabled(organizationId) {
        const org = await this.db.prepare(
            'SELECT recording_enabled, recording_mode FROM organizations_v2 WHERE id = ?'
        ).bind(organizationId).first();

        return org && org.recording_enabled && org.recording_mode !== 'disabled';
    }

    /**
     * Get recording settings for organization
     */
    async getRecordingSettings(organizationId) {
        const org = await this.db.prepare(
            'SELECT recording_enabled, recording_mode, recording_retention_days, recording_announcement FROM organizations_v2 WHERE id = ?'
        ).bind(organizationId).first();

        return org || {
            recording_enabled: true,
            recording_mode: 'automatic',
            recording_retention_days: 30,
            recording_announcement: true
        };
    }

    /**
     * Store recording metadata from Twilio callback
     */
    async storeRecording(callId, recordingSid, recordingUrl, duration, organizationId) {
        try {
            const settings = await this.getRecordingSettings(organizationId);
            const now = Math.floor(Date.now() / 1000);
            const expiresAt = now + (settings.recording_retention_days * 24 * 60 * 60);

            const recordingId = `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            await this.db.prepare(`
                INSERT INTO call_recordings (
                    id, call_id, sid, url, duration, status,
                    retention_days, expires_at, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                recordingId,
                callId,
                recordingSid,
                recordingUrl,
                duration,
                'completed',
                settings.recording_retention_days,
                expiresAt,
                now,
                now
            ).run();

            console.log(`✅ Recording ${recordingSid} stored for call ${callId}`);

            return { recordingId, expiresAt };
        } catch (error) {
            console.error('❌ Error storing recording:', error);
            throw error;
        }
    }

    /**
     * Get recordings for a call
     */
    async getCallRecordings(callId) {
        const result = await this.db.prepare(
            'SELECT * FROM call_recordings WHERE call_id = ? ORDER BY created_at DESC'
        ).bind(callId).all();

        return result.results || [];
    }

    /**
     * Get recording by ID
     */
    async getRecording(recordingId) {
        return await this.db.prepare(
            'SELECT * FROM call_recordings WHERE id = ?'
        ).bind(recordingId).first();
    }

    /**
     * Get recording download URL from Twilio
     */
    async getRecordingDownloadUrl(recordingSid) {
        try {
            const recording = await this.twilioClient.recordings(recordingSid).fetch();

            // Twilio recording URL format
            const baseUrl = `https://api.twilio.com`;
            const downloadUrl = `${baseUrl}${recording.uri.replace('.json', '.mp3')}`;

            return downloadUrl;
        } catch (error) {
            console.error('❌ Error fetching recording from Twilio:', error);
            throw error;
        }
    }

    /**
     * Delete recording
     */
    async deleteRecording(recordingId) {
        try {
            const recording = await this.getRecording(recordingId);

            if (!recording) {
                throw new Error('Recording not found');
            }

            // Delete from Twilio
            if (recording.sid) {
                await this.twilioClient.recordings(recording.sid).remove();
                console.log(`🗑️ Deleted recording ${recording.sid} from Twilio`);
            }

            // Delete from database
            await this.db.prepare(
                'DELETE FROM call_recordings WHERE id = ?'
            ).bind(recordingId).run();

            console.log(`✅ Recording ${recordingId} deleted`);

            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting recording:', error);
            throw error;
        }
    }

    /**
     * Clean up expired recordings (run daily via cron)
     */
    async cleanupExpiredRecordings() {
        try {
            const now = Math.floor(Date.now() / 1000);

            // Get expired recordings
            const result = await this.db.prepare(
                'SELECT * FROM call_recordings WHERE expires_at < ? AND expires_at IS NOT NULL'
            ).bind(now).all();

            const expiredRecordings = result.results || [];

            console.log(`🧹 Found ${expiredRecordings.length} expired recordings to clean up`);

            for (const recording of expiredRecordings) {
                try {
                    await this.deleteRecording(recording.id);
                } catch (error) {
                    console.error(`❌ Failed to delete recording ${recording.id}:`, error);
                }
            }

            return { deleted: expiredRecordings.length };
        } catch (error) {
            console.error('❌ Error cleaning up recordings:', error);
            throw error;
        }
    }

    /**
     * Get organization recording statistics
     */
    async getRecordingStats(organizationId, startDate, endDate) {
        const stats = await this.db.prepare(`
            SELECT 
                COUNT(*) as total_recordings,
                SUM(duration) as total_duration,
                SUM(size) as total_size,
                AVG(duration) as avg_duration
            FROM call_recordings cr
            JOIN calls c ON cr.call_id = c.id
            WHERE c.organization_id = ?
            AND cr.created_at BETWEEN ? AND ?
        `).bind(organizationId, startDate, endDate).first();

        return {
            totalRecordings: stats.total_recordings || 0,
            totalDuration: stats.total_duration || 0,
            totalSize: stats.total_size || 0,
            avgDuration: stats.avg_duration || 0
        };
    }

    /**
     * Update recording retention policy
     */
    async updateRetentionPolicy(organizationId, retentionDays) {
        await this.db.prepare(
            'UPDATE organizations_v2 SET recording_retention_days = ? WHERE id = ?'
        ).bind(retentionDays, organizationId).run();

        // Update expiration dates for existing recordings
        const now = Math.floor(Date.now() / 1000);

        await this.db.prepare(`
            UPDATE call_recordings
            SET 
                retention_days = ?,
                expires_at = created_at + (? * 24 * 60 * 60),
                updated_at = ?
            WHERE call_id IN (
                SELECT id FROM calls WHERE organization_id = ?
            )
        `).bind(retentionDays, retentionDays, now, organizationId).run();

        console.log(`✅ Updated retention policy to ${retentionDays} days for org ${organizationId}`);

        return { success: true, retentionDays };
    }
}

// Export helper function
export function createRecordingManager(db, twilioClient) {
    return new CallRecordingManager(db, twilioClient);
}
