// Custom Hook: Dialer Logic
// Handles call state, phone number input, and call management

import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

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
            const response = await api.get('/numbers');
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

    const setupConnectionHandlers = (conn) => {
        conn.on('accept', () => {
            console.log('✅ Call accepted');
            setIsCallActive(true);
            startCallTimer();
        });

        conn.on('disconnect', () => {
            console.log('📴 Call disconnected');
            handleCallEnd();
        });

        conn.on('cancel', () => {
            console.log('🚫 Call cancelled');
            handleCallEnd();
        });

        conn.on('reject', () => {
            console.log('❌ Call rejected');
            handleCallEnd();
        });

        conn.on('error', (error) => {
            console.error('❌ Call error:', error);
            handleCallEnd();
        });
    };

    const handleCall = async () => {
        if (!device || !phoneNumber || !selectedNumber) {
            console.error('Missing required data for call');
            return;
        }

        try {
            console.log(`📞 Initiating call from ${selectedNumber} to ${phoneNumber}`);

            const params = {
                To: phoneNumber,
                From: selectedNumber
            };

            const conn = await device.connect({ params });

            connectionRef.current = conn;
            setCurrentConnection(conn);
            setupConnectionHandlers(conn);

            // Log call to backend
            try {
                const callSid = conn.parameters.CallSid;
                await api.post('/calls/log', {
                    sid: callSid,
                    from_number: selectedNumber,
                    to_number: phoneNumber,
                    direction: 'outbound'
                });
            } catch (logError) {
                console.error('Failed to log call:', logError);
            }

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
