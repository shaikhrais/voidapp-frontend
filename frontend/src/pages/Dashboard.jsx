import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DollarSign, PhoneOutgoing, MessageSquare } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center' }}>
        <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: `${color}20`, marginRight: '1rem' }}>
            <Icon size={24} color={color} />
        </div>
        <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
            <p style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const [balance, setBalance] = useState(0);
    const [usage, setUsage] = useState({ calls: [], messages: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [balanceRes, usageRes] = await Promise.all([
                    api.get('/billing/balance'),
                    api.get('/billing/usage')
                ]);
                setBalance(balanceRes.data.credits);
                setUsage(usageRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard title="Current Balance" value={`$${parseFloat(balance).toFixed(2)}`} icon={DollarSign} color="#10b981" />
                <StatCard title="Total Calls" value={usage.calls.length} icon={PhoneOutgoing} color="#3b82f6" />
                <StatCard title="Total SMS" value={usage.messages.length} icon={MessageSquare} color="#8b5cf6" />
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Recent Activity</h3>
                {usage.calls.length === 0 && usage.messages.length === 0 ? (
                    <p style={{ color: '#6b7280' }}>No recent activity.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>Type</th>
                                <th style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>Direction</th>
                                <th style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>To/From</th>
                                <th style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>Status</th>
                                <th style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...usage.calls.map(c => ({ ...c, type: 'Call' })), ...usage.messages.map(m => ({ ...m, type: 'SMS' }))]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .slice(0, 5)
                                .map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                backgroundColor: item.type === 'Call' ? '#dbeafe' : '#f3e8ff',
                                                color: item.type === 'Call' ? '#1e40af' : '#6b21a8'
                                            }}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{item.direction || 'Outbound'}</td>
                                        <td style={{ padding: '0.75rem' }}>{item.to}</td>
                                        <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{item.status}</td>
                                        <td style={{ padding: '0.75rem', color: '#6b7280' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
