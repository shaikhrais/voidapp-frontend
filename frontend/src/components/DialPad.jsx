// DialPad Component
// Reusable dialpad with number buttons

import React from 'react';

const DialPad = ({ onDigitClick, disabled = false }) => {
    const buttons = [
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

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(0.25rem, 1vw, 0.5rem)',
            marginTop: 'clamp(0.5rem, 2vw, 1rem)'
        }}>
            {buttons.map(({ digit, letters }) => (
                <button
                    key={digit}
                    onClick={() => onDigitClick(digit)}
                    disabled={disabled}
                    style={{
                        padding: 'clamp(0.075rem, 0.3vw, 0.125rem)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '1.2px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        fontSize: 'clamp(0.6rem, 2vw, 0.8rem)',
                        fontWeight: '600',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 'clamp(1.5rem, 5vw, 2rem)',
                        opacity: disabled ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!disabled) {
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.transform = 'scale(1.05)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    <span style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)' }}>{digit}</span>
                    {letters && (
                        <span style={{
                            fontSize: 'clamp(0.25rem, 0.8vw, 0.35rem)',
                            opacity: 0.6,
                            marginTop: '1px'
                        }}>
                            {letters}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default DialPad;
