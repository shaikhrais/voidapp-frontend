// Dialer Component - Refactored and Modular
// Now uses custom hooks and small components

import React from 'react';
import { Delete } from 'lucide-react';
import { useTwilioDevice } from '../hooks/useTwilioDevice';
import { useDialer } from '../hooks/useDialer';
import DialPad from '../components/DialPad';
import CallControls from '../components/CallControls';
import CallStatus from '../components/CallStatus';
import NumberSelector from '../components/NumberSelector';

const Dialer = () => {
    // Custom hooks
    const { device, deviceReady, deviceError } = useTwilioDevice();
    const {
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
        handleDigitClick,
        handleDelete,
        handleCall,
        handleEndCall,
        toggleMute,
        formatDuration,
        formatPhoneNumber
    } = useDialer(device);

    if (deviceError) {
        return (
            <div style={{
                padding: '2rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#ef4444',
                textAlign: 'center'
            }}>
                <h3>Device Error</h3>
                <p>{deviceError}</p>
            </div>
        );
    }

    if (!deviceReady) {
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.6)'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(255, 255, 255, 0.1)',
                    borderTop: '3px solid #10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem'
                }} />
                <p>Initializing dialer...</p>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '230px',
            margin: '0 auto',
            padding: 'clamp(0.3rem, 0.8vw, 0.5rem)',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            {/* Number Selector */}
            <NumberSelector
                myNumbers={myNumbers}
                selectedNumber={selectedNumber}
                onSelectNumber={setSelectedNumber}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                formatPhoneNumber={formatPhoneNumber}
            />

            {/* Phone Number Display */}
            <div style={{
                padding: 'clamp(0.1rem, 0.3vw, 0.15rem)',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1.2px',
                marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
                minHeight: 'clamp(1.5rem, 5vw, 2rem)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem'
            }}>
                <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter number"
                    disabled={isCallActive}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                        outline: 'none',
                        textAlign: 'center'
                    }}
                />
                {phoneNumber && !isCallActive && (
                    <button
                        onClick={handleDelete}
                        style={{
                            padding: '0.25rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.6)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Delete size={16} />
                    </button>
                )}
            </div>

            {/* Call Status */}
            <CallStatus
                isCallActive={isCallActive}
                callDuration={callDuration}
                formatDuration={formatDuration}
            />

            {/* Dial Pad */}
            <DialPad
                onDigitClick={handleDigitClick}
                disabled={false}
            />

            {/* Call Controls */}
            <CallControls
                isCallActive={isCallActive}
                isMuted={isMuted}
                onCall={handleCall}
                onEndCall={handleEndCall}
                onToggleMute={toggleMute}
                disabled={!phoneNumber || !selectedNumber}
            />
        </div>
    );
};

export default Dialer;
