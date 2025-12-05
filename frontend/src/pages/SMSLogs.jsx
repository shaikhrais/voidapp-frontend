import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MessageSquare, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const SMSLogs = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get('/sms');
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>SMS Logs</h2>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {messages.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                        <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No message history found.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Direction</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>From</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>To</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Body</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Status</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((msg) => (
                                <tr key={msg.sid} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {msg.direction === 'outbound-api' ? (
                                            <ArrowUpRight size={16} color="#2563eb" />
                                        ) : (
                                            <ArrowDownLeft size={16} color="#10b981" />
                                        )}
                                        <span style={{ textTransform: 'capitalize' }}>{msg.direction}</span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#111827' }}>{msg.from}</td>
                                    <td style={{ padding: '1rem', color: '#111827' }}>{msg.to}</td>
                                    <td style={{ padding: '1rem', color: '#4b5563', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {msg.body}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            backgroundColor: msg.status === 'sent' || msg.status === 'delivered' ? '#d1fae5' : '#f3f4f6',
                                            color: msg.status === 'sent' || msg.status === 'delivered' ? '#065f46' : '#374151',
                                            textTransform: 'capitalize'
                                        }}>
                                            {msg.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(msg.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SMSLogs;
