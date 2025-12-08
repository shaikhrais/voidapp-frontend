// CallStatus Component
// Displays call duration and status

import React from 'react';
import { Clock, Phone } from 'lucide-react';

const CallStatus = ({ isCallActive, callDuration, formatDuration }) => {
    if (!isCallActive) {
        return null;
    }

    return (
        <div style={{
            marginTop: 'clamp(0.5rem, 2vw, 1rem)',
            padding: 'clamp(0.3rem, 1.5vw, 0.6rem)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
        }}>
            <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                animation: 'pulse 2s infinite'
            }} />
            <Clock size={14} style={{ color: '#10b981' }} />
            <span style={{
                color: '#10b981',
                fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                fontWeight: '600'
            }}>
                {formatDuration(callDuration)}
            </span>
        </div>
    );
};

export default CallStatus;
