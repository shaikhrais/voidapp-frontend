import React from 'react';

const LoadingSplash = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#f1f5f9',
        }}>
            {/* Animated Logo */}
            <div style={{
                marginBottom: '2rem',
                animation: 'pulse 2s ease-in-out infinite',
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: 'white',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                }}>
                    V
                </div>
            </div>

            {/* App Name */}
            <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}>
                VOIP SaaS
            </h1>

            {/* Loading Spinner */}
            <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(102, 126, 234, 0.2)',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            }} />

            {/* Loading Text */}
            <p style={{
                marginTop: '1.5rem',
                fontSize: '0.875rem',
                color: '#94a3b8',
                animation: 'fadeInOut 1.5s ease-in-out infinite',
            }}>
                Loading your dashboard...
            </p>

            {/* Keyframes */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

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

                @keyframes fadeInOut {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LoadingSplash;
