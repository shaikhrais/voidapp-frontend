import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
        }, 1500);
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                padding: '2rem',
            }}>
                <div style={{
                    background: '#1e293b',
                    borderRadius: '16px',
                    padding: '3rem',
                    maxWidth: '450px',
                    width: '100%',
                    border: '1px solid #334155',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
                    }}>
                        <CheckCircle size={35} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: '#f1f5f9',
                    }}>
                        Check Your Email
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>
                        We've sent password reset instructions to <strong style={{ color: '#cbd5e1' }}>{email}</strong>
                    </p>
                    <Link to="/login" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                    }}>
                        <ArrowLeft size={18} />
                        Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem',
        }}>
            <div style={{
                background: '#1e293b',
                borderRadius: '16px',
                padding: '3rem',
                maxWidth: '450px',
                width: '100%',
                border: '1px solid #334155',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                    }}>
                        <Mail size={35} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Forgot Password?
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        No worries, we'll send you reset instructions
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#cbd5e1',
                            marginBottom: '0.5rem'
                        }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#64748b',
                            }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 3rem',
                                    background: '#334155',
                                    border: '1px solid #475569',
                                    borderRadius: '8px',
                                    color: '#f1f5f9',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.2s',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#475569';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '1rem',
                            background: loading ? '#64748b' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                        {!loading && <Send size={20} />}
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                }}>
                    <Link to="/login" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                    }}>
                        <ArrowLeft size={18} />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
