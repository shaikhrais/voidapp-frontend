// CallControls Component
// Call/End call buttons with mute toggle

import React from 'react';
import { PhoneCall, Phone, Mic, MicOff } from 'lucide-react';

const CallControls = ({
    isCallActive,
    isMuted,
    onCall,
    onEndCall,
    onToggleMute,
    disabled = false
}) => {
    if (isCallActive) {
        return (
            <div style={{
                display: 'flex',
                gap: 'clamp(0.25rem, 1vw, 0.5rem)',
                marginTop: 'clamp(0.5rem, 2vw, 1rem)'
            }}>
                <button
                    onClick={onToggleMute}
                    style={{
                        flex: 1,
                        padding: 'clamp(0.3rem, 1.5vw, 0.6rem)',
                        border: 'none',
                        borderRadius: '8px',
                        background: isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                    }}
                >
                    {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                    {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                    onClick={onEndCall}
                    style={{
                        flex: 1,
                        padding: 'clamp(0.3rem, 1.5vw, 0.6rem)',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#dc2626';
                        e.target.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#ef4444';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    <Phone size={14} />
                    End Call
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={onCall}
            disabled={disabled}
            style={{
                width: '100%',
                padding: 'clamp(0.3rem, 1.5vw, 0.6rem)',
                marginTop: 'clamp(0.5rem, 2vw, 1rem)',
                border: 'none',
                borderRadius: '8px',
                background: disabled ? 'rgba(255, 255, 255, 0.1)' : '#10b981',
                color: 'white',
                fontSize: 'clamp(0.6rem, 2vw, 0.8rem)',
                fontWeight: '600',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: disabled ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.target.style.background = '#059669';
                    e.target.style.transform = 'scale(1.02)';
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.target.style.background = '#10b981';
                    e.target.style.transform = 'scale(1)';
                }
            }}
        >
            <PhoneCall size={16} />
            Call
        </button>
    );
};

export default CallControls;
