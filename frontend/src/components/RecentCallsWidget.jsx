import React, { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RecentCallsWidget = ({ refreshTrigger }) => {
    const [recentCalls, setRecentCalls] = useState([]);
    const [loadingCalls, setLoadingCalls] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecentCalls();

        // Auto-refresh every 5 seconds
        const interval = setInterval(() => {
            fetchRecentCalls();
        }, 5000);

        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const fetchRecentCalls = async () => {
        try {
            console.log('🔄 Fetching recent calls...');
            setLoadingCalls(true);

            const response = await api.get('/calls/recent');

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

    const getTimeAgo = (timestamp) => {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;

        if (diff < 60) return 'Just now';
        if (diff < 3600) {
            const mins = Math.floor(diff / 60);
            return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
        }
        if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
        if (diff < 604800) {
            const days = Math.floor(diff / 86400);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }

        // For older calls, show date
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatPhoneNumber = (number) => {
        if (!number) return '';
        // Remove +1 and format as (XXX) XXX-XXXX
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            const areaCode = cleaned.slice(1, 4);
            const firstPart = cleaned.slice(4, 7);
            const secondPart = cleaned.slice(7);
            return `(${areaCode}) ${firstPart}-${secondPart}`;
        }
        return number;
    };

    const getCallIcon = (call) => {
        if (call.direction === 'outbound') {
            return <PhoneOutgoing size={20} color="#10b981" />;
        } else if (call.status === 'completed') {
            return <PhoneIncoming size={20} color="#3b82f6" />;
        } else {
            return <PhoneMissed size={20} color="#ef4444" />;
        }
    };

    const handleCallClick = (call) => {
        const number = call.direction === 'outbound' ? call.to_number : call.from_number;
        console.log('Clicked call:', number);
    };

    const handleSmsClick = (e, call) => {
        e.stopPropagation(); // Prevent call click
        const number = call.direction === 'outbound' ? call.to_number : call.from_number;
        navigate('/dashboard/messages', { state: { toNumber: number } });
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
                Recent Calls
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '700px', overflowY: 'auto' }}>
                    {recentCalls.slice(0, 20).map((call) => (
                        <div
                            key={call.id}
                            style={{
                                padding: '1rem',
                                background: '#0f172a',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid transparent',
                            }}
                            onClick={() => handleCallClick(call)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#1e293b';
                                e.currentTarget.style.borderColor = '#475569';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#0f172a';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            {/* Call Icon */}
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {getCallIcon(call)}
                            </div>

                            {/* Call Details */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#f1f5f9',
                                    marginBottom: '0.25rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {formatPhoneNumber(call.direction === 'outbound' ? call.to_number : call.from_number)}
                                </div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: '#94a3b8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}>
                                    <span style={{ textTransform: 'capitalize' }}>
                                        {call.direction === 'outbound' ? 'Outgoing' : 'Incoming'}
                                    </span>
                                    {call.duration && (
                                        <>
                                            <span>•</span>
                                            <span>{call.duration}s</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* SMS Button */}
                            <button
                                onClick={(e) => handleSmsClick(e, call)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: '#334155',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#3b82f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#334155';
                                }}
                                title="Send SMS"
                            >
                                <MessageSquare size={18} color="#f1f5f9" />
                            </button>

                            {/* Time Ago */}
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#64748b',
                                textAlign: 'right',
                                flexShrink: 0,
                            }}>
                                {getTimeAgo(call.created_at)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentCallsWidget;
