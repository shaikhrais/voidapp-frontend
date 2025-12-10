// Custom Hook: Dialer Logic
// Handles call state, phone number input, and call management

import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import useNotifications from './useNotifications';

export function useDialer(device) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedNumber, setSelectedNumber] = useState('');
    const [myNumbers, setMyNumbers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Call state
    const [isCallActive, setIsCallActive] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentConnection, setCurrentConnection] = useState(null);

    const callTimerRef = useRef(null);
    const connectionRef = useRef(null);

    // Notifications
    const { requestPermission, notifyCallStatus, notifyIncomingCall } = useNotifications();

    // Request notification permission on mount
    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    useEffect(() => {
        fetchMyNumbers();
    }, []);

    useEffect(() => {
        return () => {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
        };
    }, []);

    const fetchMyNumbers = async () => {
        try {
            const response = await api.get('/admin/numbers');
            const numbers = response.data.numbers || [];
            setMyNumbers(numbers);

            if (numbers.length > 0 && !selectedNumber) {
                setSelectedNumber(numbers[0].phone_number);
            }
        } catch (error) {
            console.error('Failed to fetch numbers:', error);
        }
    };

    const handleDigitClick = (digit) => {
        setPhoneNumber(prev => prev + digit);

        if (currentConnection) {
            currentConnection.sendDigits(digit);
        }
    };

    const handleDelete = () => {
        setPhoneNumber(prev => prev.slice(0, -1));
    };

    const startCallTimer = () => {
        callTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const stopCallTimer = () => {
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
    };

    const handleCallEnd = () => {
        setIsCallActive(false);
        setCallDuration(0);
        stopCallTimer();
        setCurrentConnection(null);
        connectionRef.current = null;
    };

    const setupConnectionHandlers = (conn, tempCallId) => {
        conn.on('accept', () => {
            console.log('✅ Call accepted');
            setIsCallActive(true);
            startCallTimer();
            notifyCallStatus('connected', phoneNumber);
        });

        conn.on('disconnect', async () => {
            console.log('📴 Call disconnected');
            const duration = callDuration;
            const sid = conn.parameters.CallSid || tempCallId;

            handleCallEnd();
            notifyCallStatus('completed', phoneNumber);

            // Update call status to completed
            if (sid) {
                try {
                    await api.put(`/calls/update/${sid}`, {
                        status: 'completed',
                        duration: duration
                    });
                    console.log('✅ Call status updated to completed');
                } catch (error) {
                    console.error('Failed to update call status:', error);
                }
            }
        });

        conn.on('cancel', async () => {
            console.log('🚫 Call cancelled');
            const sid = conn.parameters.CallSid || tempCallId;

            handleCallEnd();
            notifyCallStatus('cancelled', phoneNumber);

            // Update call status to cancelled
            if (sid) {
                try {
                    await api.put(`/calls/update/${sid}`, {
                        status: 'cancelled',
                        duration: 0
                    });
                    console.log('✅ Call status updated to cancelled');
                } catch (error) {
                    console.error('Failed to update call status:', error);
                }
            }
        });

        conn.on('reject', async () => {
            console.log('❌ Call rejected');
            const sid = conn.parameters.CallSid || tempCallId;

            handleCallEnd();
            notifyCallStatus('no-answer', phoneNumber);

            // Update call status to failed
            if (sid) {
                try {
                    await api.put(`/calls/update/${sid}`, {
                        status: 'no-answer',
                        duration: 0
                    });
                    console.log('✅ Call status updated to no-answer');
                } catch (error) {
                    console.error('Failed to update call status:', error);
                }
            }
        });
    };

    const handleCall = async () => {
        if (!device || !phoneNumber || !selectedNumber) {
            console.error('Missing required data for call');
            return;
        }

        try {
            console.log(`📞 Initiating call from ${selectedNumber} to ${phoneNumber}`);

            // Log call immediately (before connection)
            const tempCallId = `temp-${Date.now()}`;
            try {
                await api.post('/calls/log', {
                    sid: tempCallId,
                    from_number: String(selectedNumber), // Ensure it's a string
                    to_number: String(phoneNumber), // Ensure it's a string
                    direction: 'outbound'
                });
                console.log('✅ Call logged with temp ID:', tempCallId);
            } catch (logError) {
                console.error('Failed to log call:', logError);
                console.error('Log error details:', logError.response?.data);
            }

            const params = {
                To: phoneNumber,
                From: selectedNumber
            };

            const conn = await device.connect({ params });

            connectionRef.current = conn;
            setCurrentConnection(conn);
            setupConnectionHandlers(conn, tempCallId);

            // Update call log with real Twilio SID when available
            conn.on('ringing', async () => {
                try {
                    const callSid = conn.parameters.CallSid;
                    if (callSid && callSid !== tempCallId) {
                        console.log('📞 Call ringing, updating with real SID:', callSid);
                        await api.put(`/calls/update/${tempCallId}`, {
                            sid: callSid,
                            status: 'ringing'
                        });
                    }
                } catch (error) {
                    console.error('Failed to update call SID:', error);
                }
            });

        } catch (error) {
            console.error('❌ Call failed:', error);
            handleCallEnd();
        }
    };

    const handleEndCall = () => {
        if (connectionRef.current) {
            connectionRef.current.disconnect();
        }
        handleCallEnd();
    };

    const toggleMute = () => {
        if (connectionRef.current) {
            const newMutedState = !isMuted;
            connectionRef.current.mute(newMutedState);
            setIsMuted(newMutedState);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPhoneNumber = (number) => {
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        return number;
    };

    return {
        // State
        phoneNumber,
        setPhoneNumber,
        selectedNumber,
        setSelectedNumber,
        myNumbers,
        isDropdownOpen,
        setIsDropdownOpen,
        isCallActive,
        callDuration,
        isMuted,

        // Actions
        handleDigitClick,
        handleDelete,
        handleCall,
        handleEndCall,
        toggleMute,

        // Utilities
        formatDuration,
        formatPhoneNumber
    };
}
