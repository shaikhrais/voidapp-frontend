import React, { useState, useEffect } from 'react';
import api from '../services/api';

const RecentCallsWidget = ({ refreshTrigger }) => {
    const [recentCalls, setRecentCalls] = useState([]);
    const [loadingCalls, setLoadingCalls] = useState(false);

    useEffect(() => {
        fetchRecentCalls();
    }, [refreshTrigger]);

    const fetchRecentCalls = async () => {
        try {
            console.log('🔄 Fetching recent calls...');
            setLoadingCalls(true);

            const response = await api.get('/api/calls/recent');

            console.log('✅ Recent calls response:', response.data);
            console.log('📊 Number of calls:', response.data.calls?.length || 0);

            setRecentCalls(response.data.calls || []);
        } catch (error) {
            console.error('❌ Error fetching recent calls:', error);
            console.error('❌ Error details:', error.response?.data || error.message);
        } finally {
            setLoadingCalls(false);
        }
    };

    const handleCallClick = (call) => {
        const number = call.direction === 'outbound' ? call.to_number : call.from_number;
        // You could emit an event or use a callback to set the number in the dialer
        console.log('Clicked call:', number);
    };

    return (
        <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            padding: '1.5rem',
            flex: 1,
            maxWidth: '500px',
            border: '1px solid #334155',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}>
            <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#f1f5f9',
                marginBottom: '1.5rem',
            }}>
                📞 Recent Calls
            </h3>

            {loadingCalls ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', padding: '3rem' }}>
                    Loading calls...
                </div>
            ) : recentCalls.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', padding: '3rem' }}>
                    No recent calls yet
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '700px', overflowY: 'auto' }}>
                    {recentCalls.slice(0, 20).map((call) => (
                        <div
                            key={call.id}
                            style={{
                                padding: '1rem',
                                background: '#0f172a',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid #334155',
                            }}
                            onClick={() => handleCallClick(call)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#1e293b';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#0f172a';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                                    {call.direction === 'outbound' ? '📞 ' : '📱 '}
                                    {call.direction === 'outbound' ? call.to_number : call.from_number}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                                    {new Date(call.created_at * 1000).toLocaleString()}
                                </div>
                                {call.user_email && (
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        by {call.user_email}
                                    </div>
                                )}
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                background: call.status === 'completed' ? '#10b98120' : call.status === 'failed' ? '#ef444420' : '#64748b20',
                                color: call.status === 'completed' ? '#10b981' : call.status === 'failed' ? '#ef4444' : '#94a3b8',
                                fontWeight: '600',
                            }}>
                                {call.duration ? `${call.duration}s` : call.status}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentCallsWidget;
