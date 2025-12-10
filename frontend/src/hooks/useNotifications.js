import { useState, useEffect, useCallback } from 'react';

const useNotifications = () => {
    const [permission, setPermission] = useState('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
    }, []);

    const showNotification = useCallback((title, options = {}) => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return;
        }

        if (Notification.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        const defaultOptions = {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);

            // Auto-close after 5 seconds if not requiring interaction
            if (!options.requireInteraction) {
                setTimeout(() => notification.close(), 5000);
            }

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }, []);

    const notifyIncomingCall = useCallback((callerNumber) => {
        return showNotification('📞 Incoming Call', {
            body: `Call from ${callerNumber}`,
            tag: 'incoming-call',
            requireInteraction: true,
            actions: [
                { action: 'answer', title: 'Answer' },
                { action: 'reject', title: 'Reject' }
            ]
        });
    }, [showNotification]);

    const notifyNewMessage = useCallback((fromNumber, preview) => {
        return showNotification('💬 New Message', {
            body: `From ${fromNumber}: ${preview}`,
            tag: 'new-message',
            requireInteraction: false
        });
    }, [showNotification]);

    const notifyCallStatus = useCallback((status, phoneNumber) => {
        const statusMessages = {
            'connected': `✅ Connected to ${phoneNumber}`,
            'completed': `✓ Call ended`,
            'failed': `❌ Call failed`,
            'cancelled': `🚫 Call cancelled`,
            'no-answer': `📵 No answer from ${phoneNumber}`,
            'busy': `📵 ${phoneNumber} is busy`
        };

        const message = statusMessages[status] || `Call status: ${status}`;

        return showNotification('Call Status', {
            body: message,
            tag: 'call-status',
            requireInteraction: false
        });
    }, [showNotification]);

    const notifyAgentStatusChange = useCallback((status) => {
        const statusEmojis = {
            'available': '✅',
            'busy': '🔴',
            'away': '🟡',
            'offline': '⚫'
        };

        return showNotification('Status Updated', {
            body: `${statusEmojis[status] || ''} You are now ${status}`,
            tag: 'agent-status',
            requireInteraction: false
        });
    }, [showNotification]);

    const notifyQueueUpdate = useCallback((queueDepth) => {
        if (queueDepth > 0) {
            return showNotification('📋 Queue Update', {
                body: `${queueDepth} caller${queueDepth > 1 ? 's' : ''} waiting in queue`,
                tag: 'queue-update',
                requireInteraction: false
            });
        }
    }, [showNotification]);

    return {
        permission,
        requestPermission,
        showNotification,
        notifyIncomingCall,
        notifyNewMessage,
        notifyCallStatus,
        notifyAgentStatusChange,
        notifyQueueUpdate
    };
};

export default useNotifications;
