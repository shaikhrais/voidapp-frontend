// NumberSelector Component
// Dropdown to select caller ID number

import React from 'react';
import { ChevronDown } from 'lucide-react';

const NumberSelector = ({
    myNumbers,
    selectedNumber,
    onSelectNumber,
    isDropdownOpen,
    setIsDropdownOpen,
    formatPhoneNumber
}) => {
    if (myNumbers.length === 0) {
        return (
            <div style={{
                padding: 'clamp(0.3rem, 1.5vw, 0.6rem)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                textAlign: 'center'
            }}>
                No phone numbers available. Please buy a number first.
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', marginBottom: 'clamp(0.5rem, 2vw, 1rem)' }}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                    width: '100%',
                    padding: 'clamp(0.3rem, 1.5vw, 0.6rem)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
            >
                <span>From: {formatPhoneNumber(selectedNumber)}</span>
                <ChevronDown size={14} style={{
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                }} />
            </button>

            {isDropdownOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.25rem',
                    background: 'rgba(30, 30, 30, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                }}>
                    {myNumbers.map((num) => (
                        <button
                            key={num.id}
                            onClick={() => {
                                onSelectNumber(num.phone_number);
                                setIsDropdownOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: 'clamp(0.3rem, 1.5vw, 0.6rem)',
                                background: selectedNumber === num.phone_number
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'transparent',
                                border: 'none',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = selectedNumber === num.phone_number
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'transparent';
                            }}
                        >
                            {formatPhoneNumber(num.phone_number)}
                            {num.friendly_name && (
                                <span style={{
                                    marginLeft: '0.5rem',
                                    opacity: 0.6,
                                    fontSize: 'clamp(0.4rem, 1.2vw, 0.6rem)'
                                }}>
                                    ({num.friendly_name})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NumberSelector;
