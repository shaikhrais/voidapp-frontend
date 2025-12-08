import React, { useState } from 'react';
import { RefreshCw, Phone, MessageSquare, PhoneCall, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [error, setError] = useState('');

    const handleSync = async (type) => {
        setSyncing(true);
        setError('');
        setSyncResult(null);

        try {
            const endpoint = type === 'all' ? '/sync/all' : `/sync/${type}`;
            const response = await api.post(endpoint);
            setSyncResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div>
            <h2 style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#f1f5f9',
                marginBottom: '2rem',
            }}>
                Settings
            </h2>

            {/* Twilio Sync Section */}
            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                border: '1px solid #334155',
                padding: '2rem',
                marginBottom: '2rem',
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#f1f5f9',
                    marginBottom: '0.5rem',
                }}>
                    Twilio Sync
                </h3>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '2rem',
                }}>
                    Sync your calls, messages, and phone numbers from Twilio
                </p>

                {/* Sync Results */}
                {syncResult && (
                    <div style={{
                        padding: '1rem',
                        background: '#0f172a',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        border: '1px solid #10b981',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            color: '#10b981',
                        }}>
                            <CheckCircle size={20} />
                            <span style={{ fontWeight: '600' }}>Sync Completed!</span>
                        </div>
                        {syncResult.results ? (
                            <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                <p>📞 Calls: {syncResult.results.calls.synced} synced, {syncResult.results.calls.errors} errors</p>
                                <p>💬 Messages: {syncResult.results.messages.synced} synced, {syncResult.results.messages.errors} errors</p>
                                <p>📱 Numbers: {syncResult.results.numbers.synced} synced, {syncResult.results.numbers.errors} errors</p>
                            </div>
                        ) : (
                            <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                Synced: {syncResult.synced}, Errors: {syncResult.errors}
                            </p>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Sync Buttons */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                }}>
                    <button
                        onClick={() => handleSync('all')}
                        disabled={syncing}
                        style={{
                            padding: '1rem',
                            background: syncing ? '#334155' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: syncing ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => {
                            if (!syncing) e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <RefreshCw size={18} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                        {syncing ? 'Syncing...' : 'Sync All'}
                    </button>

                    <button
                        onClick={() => handleSync('calls')}
                        disabled={syncing}
                        style={{
                            padding: '1rem',
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
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => {
                            if (!syncing) {
                                e.currentTarget.style.background = '#475569';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#334155';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <PhoneCall size={18} />
                        Sync Calls
                    </button>

                    <button
                        onClick={() => handleSync('messages')}
                        disabled={syncing}
                        style={{
                            padding: '1rem',
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
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => {
                            if (!syncing) {
                                e.currentTarget.style.background = '#475569';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#334155';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <MessageSquare size={18} />
                        Sync Messages
                    </button>

                    <button
                        onClick={() => handleSync('numbers')}
                        disabled={syncing}
                        style={{
                            padding: '1rem',
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
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => {
                            if (!syncing) {
                                e.currentTarget.style.background = '#475569';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#334155';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Phone size={18} />
                        Sync Numbers
                    </button>
                </div>
            </div>

            {/* Account Section */}
            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                border: '1px solid #334155',
                padding: '2rem',
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#f1f5f9',
                    marginBottom: '0.5rem',
                }}>
                    Account
                </h3>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
                }}>
                    Manage your account settings
                </p>
                <div style={{
                    padding: '1rem',
                    background: '#0f172a',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: '0.875rem',
                }}>
                    <p>More settings coming soon...</p>
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

export default Settings;
