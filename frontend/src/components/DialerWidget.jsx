import React, { useState, useEffect, useRef } from 'react';
import { Phone, Delete, PhoneCall, Mic, MicOff, ChevronDown } from 'lucide-react';
import { Device } from '@twilio/voice-sdk';
import api from '../services/api';

const DialerWidget = ({ onCallLogged }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [calling, setCalling] = useState(false);
    const [inCall, setInCall] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [myNumbers, setMyNumbers] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [showNumberSelect, setShowNumberSelect] = useState(false);
    const [device, setDevice] = useState(null);
    const [connection, setConnection] = useState(null);
    const [muted, setMuted] = useState(false);
    const [deviceReady, setDeviceReady] = useState(false);
    const [error, setError] = useState('');
    const timerRef = useRef(null);

    useEffect(() => {
        fetchMyNumbers();
        initializeDevice();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (device) {
                device.destroy();
            }
        };
    }, []);

    const fetchMyNumbers = async () => {
        try {
            const response = await api.get('/admin/numbers');
            const numbers = response.data.numbers || [];
            setMyNumbers(numbers);
            if (numbers.length > 0) {
                setSelectedNumber(numbers[0]);
            }
        } catch (error) {
            console.error('Error fetching numbers:', error);
        }
    };

    const initializeDevice = async () => {
        try {
            const response = await api.get('/voice/token');
            const { token } = response.data;

            const twilioDevice = new Device(token, {
                codecPreferences: ['opus', 'pcmu'],
                fakeLocalDTMF: true,
                enableRingingState: true,
            });

            twilioDevice.on('registered', () => {
                console.log('Twilio Device Ready');
                setDeviceReady(true);
            });

            twilioDevice.on('error', (error) => {
                console.error('Twilio Device Error:', error);
                setError(error.message);
            });

            twilioDevice.register();
            setDevice(twilioDevice);
        } catch (error) {
            console.error('Failed to initialize device:', error);
            setError('Failed to initialize calling device');
        }
    };

    const setupConnectionHandlers = (conn) => {
        conn.on('accept', () => {
            console.log('Call accepted');
            setCalling(false);
            setInCall(true);
            startTimer();
        });

        conn.on('disconnect', () => {
            console.log('Call ended');
            handleCallEnd();
        });

        conn.on('cancel', () => {
            console.log('Call cancelled');
            handleCallEnd();
        });

        conn.on('reject', () => {
            console.log('Call rejected');
            handleCallEnd();
        });
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const handleCallEnd = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setCalling(false);
        setInCall(false);
        setCallDuration(0);
        setConnection(null);
        setMuted(false);
    };

    const handleCall = async () => {
        if (!phoneNumber || !selectedNumber || !device) {
            setError('Missing phone number or device not ready');
            return;
        }

        try {
            setCalling(true);
            setError('');

            const params = {
                To: phoneNumber,
                From: selectedNumber.phone_number,
            };

            console.log('=== CALL INITIATION DEBUG ===');
            console.log('📞 Calling TO:', phoneNumber);
            console.log('📱 Calling FROM:', selectedNumber.phone_number);
            console.log('📋 Selected Number Object:', selectedNumber);
            console.log('📦 Params being sent to Twilio:', params);
            console.log('🔧 Device ready:', deviceReady);
            console.log('============================');

            const conn = await device.connect({ params });

            console.log('=== TWILIO CONNECTION DEBUG ===');
            console.log('✅ Connection established');
            console.log('📞 Connection SID:', conn.parameters.CallSid);
            console.log('📋 Connection Parameters:', conn.parameters);
            console.log('================================');

            setConnection(conn);
            setupConnectionHandlers(conn);

            // Log call to database
            try {
                const logData = {
                    sid: conn.parameters.CallSid,
                    from_number: selectedNumber.phone_number,
                    to_number: phoneNumber,
                    direction: 'outbound'
                };

                console.log('💾 Logging call to database:', logData);

                const logResponse = await api.post('/calls/log', logData);

                console.log('✅ Call logged successfully:', logResponse.data);

                // Notify parent to refresh recent calls
                if (onCallLogged) {
                    console.log('🔄 Triggering recent calls refresh...');
                    onCallLogged();
                }
            } catch (logError) {
                console.error('❌ Error logging call:', logError);
                console.error('❌ Log error details:', logError.response?.data || logError.message);
            }
        } catch (error) {
            console.error('❌ Call failed:', error);
            setError('Call failed: ' + error.message);
            setCalling(false);
        }
    };

    const handleEndCall = () => {
        if (connection) {
            connection.disconnect();
        }
        handleCallEnd();
    };

    const toggleMute = () => {
        if (connection) {
            connection.mute(!muted);
            setMuted(!muted);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNumberClick = (num) => {
        setPhoneNumber(prev => prev + num);
    };

    const handleDelete = () => {
        setPhoneNumber(prev => prev.slice(0, -1));
    };

    const dialpadButtons = [
        { num: '1', letters: '' },
        { num: '2', letters: 'ABC' },
        { num: '3', letters: 'DEF' },
        { num: '4', letters: 'GHI' },
        { num: '5', letters: 'JKL' },
        { num: '6', letters: 'MNO' },
        { num: '7', letters: 'PQRS' },
        { num: '8', letters: 'TUV' },
        { num: '9', letters: 'WXYZ' },
        { num: '*', letters: '' },
        { num: '0', letters: '+' },
        { num: '#', letters: '' },
    ];

    return (
        <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            padding: 'clamp(0.3rem, 0.8vw, 0.5rem)',
            maxWidth: '300px',
            width: '100%',
            border: '1px solid #334155',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}>
            {/* Number Selector */}
            {myNumbers.length > 0 && (
                <div style={{ marginBottom: '1rem', position: 'relative' }}>
                    <button
                        onClick={() => setShowNumberSelect(!showNumberSelect)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#f1f5f9',
                            fontSize: '0.875rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <span>From: {selectedNumber?.phone_number}</span>
                        <ChevronDown size={16} />
                    </button>

                    {showNumberSelect && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '0.5rem',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            zIndex: 10,
                            maxHeight: '200px',
                            overflowY: 'auto',
                        }}>
                            {myNumbers.map((number) => (
                                <button
                                    key={number.id}
                                    onClick={() => {
                                        setSelectedNumber(number);
                                        setShowNumberSelect(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: selectedNumber?.id === number.id ? '#1e293b' : 'transparent',
                                        border: 'none',
                                        color: '#f1f5f9',
                                        fontSize: '0.875rem',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {number.phone_number}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Phone Number Display */}
            <div style={{
                background: '#0f172a',
                borderRadius: '1.2px',
                padding: 'clamp(0.1rem, 0.3vw, 0.15rem)',
                marginBottom: '1.5rem',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #334155',
            }}>
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter number"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f1f5f9',
                        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                        textAlign: 'center',
                        width: '100%',
                        outline: 'none',
                    }}
                />
            </div>

            {/* Dialpad */}
            {!inCall && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                }}>
                    {dialpadButtons.map((btn) => (
                        <button
                            key={btn.num}
                            onClick={() => handleNumberClick(btn.num)}
                            style={{
                                aspectRatio: '1',
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                border: '1px solid #334155',
                                borderRadius: '1.2px',
                                color: '#f1f5f9',
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 'clamp(0.075rem, 0.3vw, 0.125rem)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}
                        >
                            <span>{btn.num}</span>
                            {btn.letters && (
                                <span style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                    {btn.letters}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                {!inCall && (
                    <>
                        <button
                            onClick={handleDelete}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                background: '#ef4444',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <Delete size={20} />
                        </button>
                        <button
                            onClick={handleCall}
                            disabled={!phoneNumber || calling || !deviceReady}
                            style={{
                                flex: 2,
                                padding: '1rem',
                                background: calling ? '#64748b' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: phoneNumber && !calling && deviceReady ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: phoneNumber && !calling && deviceReady ? 1 : 0.5,
                            }}
                        >
                            <PhoneCall size={20} />
                            {calling ? 'Calling...' : 'Call'}
                        </button>
                    </>
                )}
            </div>

            {/* In-Call UI */}
            {inCall && (
                <div style={{
                    background: '#0f172a',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                            {phoneNumber}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                            {formatDuration(callDuration)}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={toggleMute}
                            style={{
                                padding: '1rem',
                                background: muted ? '#ef4444' : '#334155',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            {muted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                        <button
                            onClick={handleEndCall}
                            style={{
                                padding: '1rem 2rem',
                                background: '#ef4444',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <Phone size={20} />
                            End Call
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '0.75rem',
                    background: '#ef444420',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '1rem',
                }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default DialerWidget;
