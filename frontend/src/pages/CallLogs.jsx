import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PhoneCall, ArrowUpRight, ArrowDownLeft, MessageSquare, Phone } from 'lucide-react';

const CallLogs = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCalls = async () => {
            try {
                const response = await api.get('/calls/recent');
                setCalls(response.data.calls || []);
            } catch (error) {
                console.error('Error fetching calls:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCalls();
    }, []);

    const handleCall = (phoneNumber) => {
        navigate('/dashboard/dialer', { state: { phoneNumber } });
    };

    const handleSms = (phoneNumber) => {
        navigate('/dashboard/messages', { state: { toNumber: phoneNumber } });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>Call Logs</h2>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {calls.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                        <PhoneCall size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No call history found.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Direction</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>From</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>To</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Status</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Duration</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Date</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calls.map((call) => {
                                const contactNumber = call.direction === 'outbound' ? call.to_number : call.from_number;
                                return (
                                    <tr key={call.sid || call.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {call.direction === 'outbound' ? (
                                                <ArrowUpRight size={16} color="#2563eb" />
                                            ) : (
                                                <ArrowDownLeft size={16} color="#10b981" />
                                            )}
                                            <span style={{ textTransform: 'capitalize' }}>{call.direction}</span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#111827' }}>{call.from_number}</td>
                                        <td style={{ padding: '1rem', color: '#111827' }}>{call.to_number}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                backgroundColor: call.status === 'completed' ? '#d1fae5' :
                                                    call.status === 'cancelled' ? '#fef3c7' :
                                                        call.status === 'initiated' ? '#dbeafe' : '#fee2e2',
                                                color: call.status === 'completed' ? '#065f46' :
                                                    call.status === 'cancelled' ? '#92400e' :
                                                        call.status === 'initiated' ? '#1e40af' : '#991b1b',
                                                textTransform: 'capitalize'
                                            }}>
                                                {call.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#6b7280' }}>
                                            {call.duration ? `${call.duration}s` : '-'}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#6b7280' }}>
                                            {new Date(call.created_at * 1000).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleCall(contactNumber)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #d1d5db',
                                                        background: 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#10b981';
                                                        e.currentTarget.style.borderColor = '#10b981';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.borderColor = '#d1d5db';
                                                    }}
                                                    title="Call"
                                                >
                                                    <Phone size={16} color="#374151" />
                                                </button>
                                                <button
                                                    onClick={() => handleSms(contactNumber)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #d1d5db',
                                                        background: 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#3b82f6';
                                                        e.currentTarget.style.borderColor = '#3b82f6';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.borderColor = '#d1d5db';
                                                    }}
                                                    title="Send SMS"
                                                >
                                                    <MessageSquare size={16} color="#374151" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CallLogs;
