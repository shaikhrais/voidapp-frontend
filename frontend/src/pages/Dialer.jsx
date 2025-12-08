import React, { useState } from 'react';
import { Phone, Delete, PhoneCall, User, Clock, Volume2 } from 'lucide-react';

const Dialer = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [calling, setCalling] = useState(false);
    const [inCall, setInCall] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

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
        if (!inCall) {
            setPhoneNumber(prev => prev + digit);
        }
    };

    const handleDelete = () => {
        setPhoneNumber(prev => prev.slice(0, -1));
    };

    const handleCall = () => {
        if (phoneNumber) {
            setCalling(true);
            // Simulate call connection
            setTimeout(() => {
                setCalling(false);
                setInCall(true);
                // Start call timer
                const timer = setInterval(() => {
                    setCallDuration(prev => prev + 1);
                }, 1000);
                // Store timer to clear later
                window.callTimer = timer;
            }, 2000);
        }
    };

    const handleEndCall = () => {
        setInCall(false);
        setCalling(false);
        setCallDuration(0);
        setPhoneNumber('');
        if (window.callTimer) {
            clearInterval(window.callTimer);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPhoneNumber = (number) => {
        // Format as (XXX) XXX-XXXX for display
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
            minHeight: 'calc(100vh - 200px)',
        }}>
            <div style={{
                background: '#1e293b',
                borderRadius: '24px',
                padding: '2.5rem',
                maxWidth: '450px',
                width: '100%',
                border: '1px solid #334155',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 1rem',
                        background: inCall ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                            calling ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                        animation: calling ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    }}>
                        <Phone size={40} color="white" />
                    </div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#f1f5f9',
                        marginBottom: '0.5rem',
                    }}>
                        {inCall ? 'In Call' : calling ? 'Calling...' : 'Dialer'}
                    </h2>
                    {inCall && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: '#10b981',
                            fontSize: '0.875rem',
                        }}>
                            <Clock size={16} />
                            <span>{formatDuration(callDuration)}</span>
                        </div>
                    )}
                </div>

                {/* Phone Number Display */}
                <div style={{
                    background: '#0f172a',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #334155',
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: '600',
                        color: phoneNumber ? '#f1f5f9' : '#64748b',
                        letterSpacing: '0.05em',
                    }}>
                        {phoneNumber ? formatPhoneNumber(phoneNumber) : 'Enter number'}
                    </div>
                </div>

                {/* Dialpad */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                }}>
                    {dialpadButtons.map((button) => (
                        <button
                            key={button.digit}
                            onClick={() => handleDigitClick(button.digit)}
                            disabled={inCall}
                            style={{
                                background: '#334155',
                                border: '1px solid #475569',
                                borderRadius: '16px',
                                padding: '1.25rem',
                                cursor: inCall ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: inCall ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (!inCall) {
                                    e.currentTarget.style.background = '#475569';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#334155';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <div style={{
                                fontSize: '1.75rem',
                                fontWeight: '600',
                                color: '#f1f5f9',
                                marginBottom: '0.25rem',
                            }}>
                                {button.digit}
                            </div>
                            {button.letters && (
                                <div style={{
                                    fontSize: '0.75rem',
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
                }}>
                    {!inCall && !calling && (
                        <>
                            <button
                                onClick={handleDelete}
                                disabled={!phoneNumber}
                                style={{
                                    width: '60px',
                                    height: '60px',
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
                                onMouseEnter={(e) => {
                                    if (phoneNumber) {
                                        e.currentTarget.style.background = '#475569';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#334155';
                                }}
                            >
                                <Delete size={24} color="#f1f5f9" />
                            </button>
                            <button
                                onClick={handleCall}
                                disabled={!phoneNumber}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: phoneNumber ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#334155',
                                    border: 'none',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: phoneNumber ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s',
                                    boxShadow: phoneNumber ? '0 8px 20px rgba(16, 185, 129, 0.4)' : 'none',
                                }}
                                onMouseEnter={(e) => {
                                    if (phoneNumber) {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                <PhoneCall size={32} color="white" />
                            </button>
                        </>
                    )}
                    {(inCall || calling) && (
                        <button
                            onClick={handleEndCall}
                            style={{
                                width: '80px',
                                height: '80px',
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
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <PhoneCall size={32} color="white" style={{ transform: 'rotate(135deg)' }} />
                        </button>
                    )}
                </div>

                {/* Call Info */}
                {inCall && (
                    <div style={{
                        marginTop: '2rem',
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
            </div>

            {/* Keyframes for pulse animation */}
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
