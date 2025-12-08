import React, { useState, useEffect, useRef } from 'react';
import { Phone, Delete, PhoneCall, User, Clock, Volume2, ChevronDown, Mic, MicOff } from 'lucide-react';
import { Device } from '@twilio/voice-sdk';
import api from '../services/api';

const Dialer = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [calling, setCalling] = useState(false);
    const [inCall, setInCall] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [myNumbers, setMyNumbers] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [showNumberSelect, setShowNumberSelect] = useState(false);
    const [recentCalls, setRecentCalls] = useState([]);
    const [loadingCalls, setLoadingCalls] = useState(false);
    const [device, setDevice] = useState(null);
    const [connection, setConnection] = useState(null);
    const [muted, setMuted] = useState(false);
    const [deviceReady, setDeviceReady] = useState(false);
    const [error, setError] = useState('');
    const timerRef = useRef(null);

    useEffect(() => {
        fetchMyNumbers();
        fetchRecentCalls();
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
            const response = await api.get('/numbers');
            const numbers = response.data.numbers || [];
            setMyNumbers(numbers);
            if (numbers.length > 0) {
                setSelectedNumber(numbers[0]);
            }
        } catch (error) {
            console.error('Error fetching numbers:', error);
        }
    };

    const fetchRecentCalls = async () => {
        try {
            setLoadingCalls(true);
            const response = await api.get('/calls/recent');
            setRecentCalls(response.data.calls || []);
        } catch (error) {
            console.error('Error fetching recent calls:', error);
        } finally {
            setLoadingCalls(false);
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
                setError('');
            });

            twilioDevice.on('error', (error) => {
                console.error('Twilio Device Error:', error);
                setError('Device error: ' + error.message);
            });

            twilioDevice.on('incoming', (conn) => {
                console.log('Incoming call');
                setConnection(conn);
                setupConnectionHandlers(conn);
            });

            await twilioDevice.register();
            setDevice(twilioDevice);
        } catch (error) {
            console.error('Failed to initialize device:', error);
            setError('Failed to initialize: ' + error.message);
        }
    };

    const setupConnectionHandlers = (conn) => {
        conn.on('accept', () => {
            console.log('Call accepted');
            setCalling(false);
            setInCall(true);
            startCallTimer();
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

        conn.on('error', (error) => {
            console.error('Connection error:', error);
            setError('Call error: ' + error.message);
            handleCallEnd();
        });
    };

    const startCallTimer = () => {
        timerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const handleCallEnd = () => {
        setInCall(false);
        setCalling(false);
        setCallDuration(0);
        setPhoneNumber('');
        setConnection(null);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const dialpadButtons = [
        { digit: '1', letters: '' },
        { digit: '2', letters: 'ABC' },
        { digit: '3', letters: 'DEF' },
        { digit: '4', letters: 'GHI' },
        { digit: '5', letters: 'JKL' },
        { digit: '6', letters: 'MNO' },
        { digit: '7', letters: 'PQRS' },
        { digit: '8', letters: 'TUV' },
        { digit: '9', letters: 'WXYZ' },
        { digit: '*', letters: '' },
        { digit: '0', letters: '+' },
        { digit: '#', letters: '' },
    ];

    const handleDigitClick = (digit) => {
        if (inCall && connection) {
            connection.sendDigits(digit);
        } else {
            setPhoneNumber(prev => prev + digit);
        }
    };

    const handleDelete = () => {
        setPhoneNumber(prev => prev.slice(0, -1));
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
                From: selectedNumber.phone_number, // ✅ Use selected number as caller ID
            };

            console.log('Making call from:', selectedNumber.phone_number, 'to:', phoneNumber);

            const conn = await device.connect({ params });
            setConnection(conn);
            setupConnectionHandlers(conn);

            // Log call to database
            try {
                await api.post('/calls/log', {
                    sid: conn.parameters.CallSid,
                    from_number: selectedNumber.phone_number,
                    to_number: phoneNumber,
                    direction: 'outbound'
                });
                // Refresh recent calls after logging
                fetchRecentCalls();
            } catch (logError) {
                console.error('Error logging call:', logError);
            }
        } catch (error) {
            console.error('Call failed:', error);
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

    const formatPhoneNumber = (number) => {
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            minHeight: '100%',
        }}>
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
                {myNumbers.length > 0 && !inCall && (
                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#94a3b8',
                            marginBottom: '0.5rem',
                        }}>
                            Calling From
                        </label>
                        <button
                            onClick={() => setShowNumberSelect(!showNumberSelect)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            <span>{selectedNumber?.friendly_name || selectedNumber?.phone_number || 'Select Number'}</span>
                            <ChevronDown size={18} style={{
                                transform: showNumberSelect ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                            }} />
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
                                borderRadius: '8px',
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
                                            padding: '0.75rem 1rem',
                                            background: selectedNumber?.id === number.id ? '#334155' : 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid #334155',
                                            color: '#f1f5f9',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <div style={{ fontWeight: '600' }}>{number.friendly_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{number.phone_number}</div>
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
                    minHeight: 'clamp(60px, 15vw, 80px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #334155',
                }}>
                    <div style={{
                        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                        fontWeight: '600',
                        color: phoneNumber ? '#f1f5f9' : '#64748b',
                        letterSpacing: '0.05em',
                        wordBreak: 'break-all',
                    }}>
                        {phoneNumber ? formatPhoneNumber(phoneNumber) : 'Enter number'}
                    </div>
                </div>

                {/* Dialpad */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'clamp(0.5rem, 2vw, 1rem)',
                    marginBottom: '1.5rem',
                }}>
                    {dialpadButtons.map((button) => (
                        <button
                            key={button.digit}
                            onClick={() => handleDigitClick(button.digit)}
                            style={{
                                background: '#334155',
                                border: '1px solid #475569',
                                borderRadius: '1.2px',
                                padding: 'clamp(0.075rem, 0.3vw, 0.125rem)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                aspectRatio: '1',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#475569';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#334155';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <div style={{
                                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                                fontWeight: '600',
                                color: '#f1f5f9',
                                marginBottom: '0.125rem',
                            }}>
                                {button.digit}
                            </div>
                            {button.letters && (
                                <div style={{
                                    fontSize: 'clamp(0.625rem, 2vw, 0.75rem)',
                                    color: '#94a3b8',
                                    letterSpacing: '0.1em',
                                }}>
                                    {button.letters}
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    {!inCall && !calling && (
                        <>
                            <button
                                onClick={handleDelete}
                                disabled={!phoneNumber}
                                style={{
                                    width: 'clamp(50px, 12vw, 60px)',
                                    height: 'clamp(50px, 12vw, 60px)',
                                    background: '#334155',
                                    border: '1px solid #475569',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: phoneNumber ? 'pointer' : 'not-allowed',
                                    opacity: phoneNumber ? 1 : 0.5,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Delete size={window.innerWidth < 400 ? 20 : 24} color="#f1f5f9" />
                            </button>
                            <button
                                onClick={handleCall}
                                disabled={!phoneNumber || !selectedNumber || !deviceReady}
                                style={{
                                    width: 'clamp(70px, 18vw, 80px)',
                                    height: 'clamp(70px, 18vw, 80px)',
                                    background: (phoneNumber && selectedNumber && deviceReady) ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#334155',
                                    border: 'none',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: (phoneNumber && selectedNumber && deviceReady) ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s',
                                    boxShadow: (phoneNumber && selectedNumber && deviceReady) ? '0 8px 20px rgba(16, 185, 129, 0.4)' : 'none',
                                }}
                            >
                                <PhoneCall size={window.innerWidth < 400 ? 28 : 32} color="white" />
                            </button>
                        </>
                    )}
                    {(inCall || calling) && (
                        <>
                            <button
                                onClick={toggleMute}
                                style={{
                                    width: 'clamp(50px, 12vw, 60px)',
                                    height: 'clamp(50px, 12vw, 60px)',
                                    background: muted ? '#ef4444' : '#334155',
                                    border: '1px solid #475569',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {muted ? <MicOff size={24} color="white" /> : <Mic size={24} color="#f1f5f9" />}
                            </button>
                            <button
                                onClick={handleEndCall}
                                style={{
                                    width: 'clamp(70px, 18vw, 80px)',
                                    height: 'clamp(70px, 18vw, 80px)',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)',
                                }}
                            >
                                <PhoneCall size={window.innerWidth < 400 ? 28 : 32} color="white" style={{ transform: 'rotate(135deg)' }} />
                            </button>
                        </>
                    )}
                </div>

                {/* Call Info */}
                {inCall && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '0.75rem',
                        }}>
                            <User size={20} color="#94a3b8" />
                            <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                {formatPhoneNumber(phoneNumber)}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            <Volume2 size={20} color="#10b981" />
                            <div style={{
                                flex: 1,
                                height: '4px',
                                background: '#334155',
                                borderRadius: '9999px',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: '70%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Calls */}
                <div style={{
                    marginTop: '1rem',
                    background: '#0f172a',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    border: '1px solid #334155',
                }}>
                    <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#f1f5f9',
                        marginBottom: '0.75rem',
                    }}>
                        📞 Recent Calls
                    </h3>
                    {loadingCalls ? (
                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', padding: '1rem' }}>Loading...</div>
                    ) : recentCalls.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', padding: '1rem' }}>No recent calls</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {recentCalls.slice(0, 5).map((call) => (
                                <div key={call.id} style={{ padding: '0.5rem', background: '#1e293b', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setPhoneNumber(call.direction === 'outbound' ? call.to_number : call.from_number)} onMouseEnter={(e) => e.currentTarget.style.background = '#334155'} onMouseLeave={(e) => e.currentTarget.style.background = '#1e293b'}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#f1f5f9' }}>
                                            {call.direction === 'outbound' ? '📞 ' : '📱 '}{call.direction === 'outbound' ? call.to_number : call.from_number}
                                        </div>
                                        <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                                            {new Date(call.created_at * 1000).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.625rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: call.status === 'completed' ? '#10b98120' : call.status === 'failed' ? '#ef444420' : '#64748b20', color: call.status === 'completed' ? '#10b981' : call.status === 'failed' ? '#ef4444' : '#94a3b8', fontWeight: '600' }}>
                                        {call.duration ? `${call.duration}s` : call.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Keyframes */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% { 
                        transform: scale(1.05);
                        opacity: 0.8;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dialer;
