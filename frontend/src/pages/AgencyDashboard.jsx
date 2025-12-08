import React, { useEffect, useState } from 'react';
import { Plus, Building2, Users, DollarSign, X } from 'lucide-react';
import api from '../services/api';

const AgencyDashboard = () => {
    const [stats, setStats] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        call_rate: '',
        sms_rate: '',
        number_fee: '',
    });

    useEffect(() => {
        fetchDashboard();
        fetchCustomers();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/agency/dashboard');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/agency/customers');
            setCustomers(response.data.customers);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/agency/customers', formData);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', call_rate: '', sms_rate: '', number_fee: '' });
            fetchCustomers();
            fetchDashboard();
        } catch (error) {
            console.error('Error creating customer:', error);
            alert(error.response?.data?.error || 'Failed to create customer');
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#94a3b8' }}>Loading...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                        Agency Dashboard
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Manage your business customers
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <Plus size={18} />
                    Add Customer
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Customers</div>
                    <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: '700' }}>{stats?.totalCustomers || 0}</div>
                </div>
                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Users</div>
                    <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: '700' }}>{stats?.totalUsers || 0}</div>
                </div>
                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Calls</div>
                    <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: '700' }}>{stats?.totalCalls || 0}</div>
                </div>
                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Credits</div>
                    <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: '700' }}>${(stats?.credits || 0).toFixed(2)}</div>
                </div>
            </div>

            {/* Customers List */}
            <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '1.5rem' }}>
                    Business Customers
                </h2>
                {customers.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No customers yet</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {customers.map((customer) => (
                            <div
                                key={customer.id}
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
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '0.25rem' }}>
                                        {customer.name}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                        Users: {customer.userCount} • Calls: {customer.totalCalls} • Credits: ${customer.credits.toFixed(2)}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.25rem 0.75rem',
                                    background: customer.status === 'active' ? '#10b98120' : '#64748b20',
                                    color: customer.status === 'active' ? '#10b981' : '#64748b',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                }}>
                                    {customer.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem',
                }}>
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        maxWidth: '500px',
                        width: '100%',
                    }}>
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #334155',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: '700' }}>
                                Add Business Customer
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        Business Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#0f172a',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#f1f5f9',
                                            fontSize: '0.875rem',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        Admin Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#0f172a',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#f1f5f9',
                                            fontSize: '0.875rem',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#0f172a',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#f1f5f9',
                                            fontSize: '0.875rem',
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            Call Rate ($/min)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            placeholder="Default"
                                            value={formData.call_rate}
                                            onChange={(e) => setFormData({ ...formData, call_rate: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: '#0f172a',
                                                border: '1px solid #334155',
                                                borderRadius: '8px',
                                                color: '#f1f5f9',
                                                fontSize: '0.875rem',
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            SMS Rate ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            placeholder="Default"
                                            value={formData.sms_rate}
                                            onChange={(e) => setFormData({ ...formData, sms_rate: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: '#0f172a',
                                                border: '1px solid #334155',
                                                borderRadius: '8px',
                                                color: '#f1f5f9',
                                                fontSize: '0.875rem',
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            Number Fee ($/mo)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Default"
                                            value={formData.number_fee}
                                            onChange={(e) => setFormData({ ...formData, number_fee: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: '#0f172a',
                                                border: '1px solid #334155',
                                                borderRadius: '8px',
                                                color: '#f1f5f9',
                                                fontSize: '0.875rem',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#334155',
                                        border: '1px solid #475569',
                                        borderRadius: '8px',
                                        color: '#f1f5f9',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Create Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgencyDashboard;
