import React, { useEffect, useState } from 'react';
import { Phone, Plus, RefreshCw, Trash2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MyNumbers = () => {
    const [numbers, setNumbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const navigate = useNavigate();

    const fetchNumbers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/numbers');
            setNumbers(response.data.numbers || []);
        } catch (error) {
            console.error('Error fetching numbers:', error);
            setNumbers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNumbers();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post('/sync/numbers');
            await fetchNumbers();
        } catch (error) {
            console.error('Sync error:', error);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                color: '#94a3b8'
            }}>
                Loading numbers...
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
            }}>
                <h2 style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#f1f5f9',
                }}>
                    My Phone Numbers
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#334155',
                            color: '#f1f5f9',
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: syncing ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => {
                            if (!syncing) e.currentTarget.style.background = '#475569';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#334155';
                        }}
                    >
                        <RefreshCw size={18} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                        {syncing ? 'Syncing...' : 'Sync from Twilio'}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/numbers/buy')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                        <Plus size={18} />
                        Buy Number
                    </button>
                </div>
            </div>

            {/* Numbers List */}
            {numbers.length === 0 ? (
                <div style={{
                    background: '#1e293b',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    padding: '3rem',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.5,
                    }}>
                        <Phone size={40} color="white" />
                    </div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#f1f5f9',
                        marginBottom: '0.5rem',
                    }}>
                        No Phone Numbers Yet
                    </h3>
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        marginBottom: '1.5rem',
                    }}>
                        Get started by syncing from Twilio or buying a new number
                    </p>
                    <button
                        onClick={handleSync}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <RefreshCw size={18} />
                        Sync from Twilio
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gap: '1rem',
                }}>
                    {numbers.map((number) => (
                        <div
                            key={number.id}
                            style={{
                                background: '#1e293b',
                                borderRadius: '12px',
                                border: '1px solid #334155',
                                padding: '1.5rem',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#334155';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '0.75rem',
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Phone size={24} color="white" />
                                        </div>
                                        <div>
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                color: '#f1f5f9',
                                                marginBottom: '0.25rem',
                                            }}>
                                                {number.friendly_name || number.phone_number}
                                            </h3>
                                            <p style={{
                                                color: '#94a3b8',
                                                fontSize: '0.875rem',
                                            }}>
                                                {number.phone_number}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        flexWrap: 'wrap',
                                    }}>
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            background: '#0f172a',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            color: '#cbd5e1',
                                        }}>
                                            <strong>SID:</strong> {number.sid}
                                        </div>
                                        {number.capabilities && (
                                            <div style={{
                                                padding: '0.5rem 1rem',
                                                background: '#0f172a',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                color: '#10b981',
                                            }}>
                                                ✓ Voice, SMS, MMS
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                }}>
                                    <button
                                        style={{
                                            padding: '0.5rem',
                                            background: '#334155',
                                            border: '1px solid #475569',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#475569';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#334155';
                                        }}
                                    >
                                        <Settings size={18} color="#94a3b8" />
                                    </button>
                                    <button
                                        style={{
                                            padding: '0.5rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        }}
                                    >
                                        <Trash2 size={18} color="#ef4444" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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

export default MyNumbers;
