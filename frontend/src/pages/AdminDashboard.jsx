import React, { useEffect, useState } from 'react';
import { Users, Building2, Phone, TrendingUp, DollarSign, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrgs, setRecentOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            setStats(response.data.stats);
            setRecentOrgs(response.data.recentOrganizations);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
        <div
            onClick={onClick}
            style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #334155',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
                if (onClick) {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: `${color}20`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Icon size={24} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        {label}
                    </div>
                    <div style={{ color: '#f1f5f9', fontSize: '1.875rem', fontWeight: '700' }}>
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );

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
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#f1f5f9',
                    marginBottom: '0.5rem',
                }}>
                    Super Admin Dashboard
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Manage your entire VOIP platform
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem',
            }}>
                <StatCard
                    icon={Building2}
                    label="Total Agencies"
                    value={stats?.totalAgencies || 0}
                    color="#667eea"
                    onClick={() => navigate('/admin/agencies')}
                />
                <StatCard
                    icon={Users}
                    label="Business Customers"
                    value={stats?.totalBusinesses || 0}
                    color="#10b981"
                />
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats?.totalUsers || 0}
                    color="#f59e0b"
                />
                <StatCard
                    icon={Phone}
                    label="Phone Numbers"
                    value={stats?.totalNumbers || 0}
                    color="#06b6d4"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Total Calls"
                    value={stats?.totalCalls || 0}
                    color="#8b5cf6"
                />
                <StatCard
                    icon={MessageSquare}
                    label="Total Messages"
                    value={stats?.totalMessages || 0}
                    color="#ec4899"
                />
            </div>

            {/* Revenue Card */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem',
                color: 'white',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <DollarSign size={32} />
                    <div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                            Total Revenue
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                            ${(stats?.totalRevenue || 0).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Organizations */}
            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                border: '1px solid #334155',
                padding: '1.5rem',
            }}>
                <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#f1f5f9',
                    marginBottom: '1.5rem',
                }}>
                    Recent Organizations
                </h2>
                {recentOrgs.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                        No organizations yet
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentOrgs.map((org) => (
                            <div
                                key={org.id}
                                style={{
                                    padding: '1rem',
                                    background: '#0f172a',
                                    borderRadius: '8px',
                                    border: '1px solid #334155',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div>
                                    <div style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '0.25rem' }}>
                                        {org.name}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                        Type: {org.type} • Credits: ${org.credits.toFixed(2)}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.25rem 0.75rem',
                                    background: org.status === 'active' ? '#10b98120' : '#64748b20',
                                    color: org.status === 'active' ? '#10b981' : '#64748b',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                }}>
                                    {org.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div style={{
                marginTop: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
            }}>
                <button
                    onClick={() => navigate('/admin/agencies')}
                    style={{
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Manage Agencies
                </button>
                <button
                    onClick={() => navigate('/admin/analytics')}
                    style={{
                        padding: '1rem',
                        background: '#334155',
                        color: '#f1f5f9',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
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
                    View Analytics
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
