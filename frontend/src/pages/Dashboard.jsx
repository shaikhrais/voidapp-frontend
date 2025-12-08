import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DollarSign, PhoneOutgoing, MessageSquare } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div style={{
        background: '#1e293b',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s'
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = color;
            e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#334155';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    >
        <div style={{
            padding: '1rem',
            borderRadius: '12px',
            background: `${color}20`,
            marginRight: '1rem'
        }}>
            <Icon size={24} color={color} />
        </div>
        <div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
            <p style={{ color: '#f1f5f9', fontSize: '1.875rem', fontWeight: '700' }}>{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const [balance, setBalance] = useState(0);
    const [usage, setUsage] = useState({ calls: 0, messages: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [balanceRes, usageRes] = await Promise.all([
                    api.get('/billing/balance'),
                    api.get('/billing/usage')
                ]);
                setBalance(balanceRes.data.balance || 0);
                setUsage({
                    calls: usageRes.data.calls || 0,
                    messages: usageRes.data.messages || 0
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                color: '#94a3b8'
            }}>
                Loading dashboard...
            </div>
        );
    }

    return (
        <div>
            <h2 style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#f1f5f9',
                marginBottom: '2rem'
            }}>
                Overview
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    title="Current Balance"
                    value={`$${parseFloat(balance).toFixed(2)}`}
                    icon={DollarSign}
                    color="#10b981"
                />
                <StatCard
                    title="Total Calls"
                    value={usage.calls}
                    icon={PhoneOutgoing}
                    color="#6366f1"
                />
                <StatCard
                    title="Total SMS"
                    value={usage.messages}
                    icon={MessageSquare}
                    color="#ec4899"
                />
            </div>

            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                border: '1px solid #334155',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                padding: '1.5rem'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#f1f5f9',
                    marginBottom: '1rem'
                }}>
                    Quick Stats
                </h3>
                <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                    <p style={{ marginBottom: '0.5rem' }}>
                        📞 <strong style={{ color: '#f1f5f9' }}>{usage.calls}</strong> calls made
                    </p>
                    <p style={{ marginBottom: '0.5rem' }}>
                        💬 <strong style={{ color: '#f1f5f9' }}>{usage.messages}</strong> messages sent
                    </p>
                    <p>
                        💰 <strong style={{ color: '#10b981' }}>${parseFloat(balance).toFixed(2)}</strong> remaining balance
                    </p>
                </div>
                {usage.calls === 0 && usage.messages === 0 && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: '#334155',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#94a3b8'
                    }}>
                        <p>🚀 Get started by purchasing a phone number!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
