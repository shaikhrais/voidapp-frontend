import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PhoneCall, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const CallLogs = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCalls = async () => {
            try {
                const response = await api.get('/calls');
                setCalls(response.data);
            } catch (error) {
                console.error('Error fetching calls:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCalls();
    }, []);

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
                            </tr>
                        </thead>
                        <tbody>
                            {calls.map((call) => (
                                <tr key={call.sid} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {call.direction === 'outbound-api' || call.direction === 'outbound-dial' ? (
                                            <ArrowUpRight size={16} color="#2563eb" />
                                        ) : (
                                            <ArrowDownLeft size={16} color="#10b981" />
                                        )}
                                        <span style={{ textTransform: 'capitalize' }}>{call.direction}</span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#111827' }}>{call.from}</td>
                                    <td style={{ padding: '1rem', color: '#111827' }}>{call.to}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            backgroundColor: call.status === 'completed' ? '#d1fae5' : '#fee2e2',
                                            color: call.status === 'completed' ? '#065f46' : '#991b1b',
                                            textTransform: 'capitalize'
                                        }}>
                                            {call.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#6b7280' }}>{call.duration}s</td>
                                    <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(call.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CallLogs;
