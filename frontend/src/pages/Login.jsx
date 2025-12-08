import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Phone, Zap, Shield, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            background: '#0f172a',
            overflow: 'hidden',
        }}>
            {/* Left Side - Branding */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                }} />

                {/* Logo */}
                <div style={{ position: 'relative', zIndex: 1, marginBottom: '2rem' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.75rem',
                        backdropFilter: 'blur(10px)',
                    }}>
                        <Phone size={24} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: 'white',
                        marginBottom: '0.5rem',
                    }}>
                        VOIP SaaS
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.5',
                        maxWidth: '350px',
                    }}>
                        Enterprise-grade voice and messaging platform
                    </p>
                </div>

                {/* Features */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {[
                        { icon: Zap, text: 'Lightning-fast call routing' },
                        { icon: Shield, text: 'Bank-level security' },
                        { icon: Phone, text: 'Global phone numbers' },
                    ].map((feature, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '0.75rem',
                            color: 'white',
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(10px)',
                            }}>
                                <feature.icon size={18} />
                            </div>
                            <span style={{ fontSize: '0.875rem' }}>{feature.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: '#0f172a',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            color: '#f1f5f9',
                            marginBottom: '0.5rem',
                        }}>
                            Welcome back
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                            Enter your credentials to access your account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#ef4444',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#cbd5e1',
                                marginBottom: '0.5rem'
                            }}>
                                Email
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
                                    placeholder="name@company.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.background = '#0f172a';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#334155';
                                        e.target.style.background = '#1e293b';
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#cbd5e1',
                                }}>
                                    Password
                                </label>
                                <Link to="/forgot-password" style={{
                                    fontSize: '0.8125rem',
                                    color: '#667eea',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    transition: 'color 0.2s',
                                }}
                                    onMouseEnter={(e) => e.target.style.color = '#818cf8'}
                                    onMouseLeave={(e) => e.target.style.color = '#667eea'}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#64748b',
                                }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.background = '#0f172a';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#334155';
                                        e.target.style.background = '#1e293b';
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
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(102, 126, 234, 0.4)',
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTop: '2px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div style={{
                        marginTop: '2rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: '#94a3b8',
                    }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{
                            color: '#667eea',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'color 0.2s',
                        }}
                            onMouseEnter={(e) => e.target.style.color = '#818cf8'}
                            onMouseLeave={(e) => e.target.style.color = '#667eea'}
                        >
                            Sign up for free
                        </Link>
                    </div>
                </div>
            </div>

            {/* Keyframes for spinner */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Login;
