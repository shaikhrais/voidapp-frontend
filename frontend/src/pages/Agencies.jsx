import React, { useEffect, useState } from 'react';
import { Plus, Building2, Users, DollarSign, Edit, Trash2, X } from 'lucide-react';
import api from '../services/api';

const Agencies = () => {
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        billing_email: '',
        call_rate: '0.02',
        sms_rate: '0.01',
        number_fee: '2.00',
    });

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            const response = await api.get('/admin/agencies');
            setAgencies(response.data.agencies);
        } catch (error) {
            console.error('Error fetching agencies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/agencies', formData);
            setShowModal(false);
            setFormData({
                name: '',
                email: '',
                password: '',
                billing_email: '',
                call_rate: '0.02',
                sms_rate: '0.01',
                number_fee: '2.00',
            });
            fetchAgencies();
        } catch (error) {
            console.error('Error creating agency:', error);
            alert(error.response?.data?.error || 'Failed to create agency');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to suspend this agency?')) return;

        try {
            await api.delete(`/admin/agencies/${id}`);
            fetchAgencies();
        } catch (error) {
            console.error('Error deleting agency:', error);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                color: '#94a3b8'
            }}>
                Loading agencies...
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#f1f5f9',
                        marginBottom: '0.5rem',
                    }}>
                        Agencies
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Manage your sub-agencies and their customers
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
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <Plus size={18} />
                    Create Agency
                </button>
            </div>

            {/* Agencies Grid */}
            {agencies.length === 0 ? (
                <div style={{
                    background: '#1e293b',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    padding: '3rem',
                    textAlign: 'center',
                }}>
                    <Building2 size={48} color="#667eea" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>
                        No Agencies Yet
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Create your first agency to get started
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {agencies.map((agency) => (
                        <div
                            key={agency.id}
                            style={{
                                background: '#1e293b',
                                borderRadius: '12px',
                                border: '1px solid #334155',
                                padding: '1.5rem',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#334155';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Agency Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '1rem',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        color: '#f1f5f9',
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        marginBottom: '0.25rem',
                                    }}>
                                        {agency.name}
                                    </h3>
                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                        {agency.owner_email}
                                    </p>
                                </div>
                                <div style={{
                                    padding: '0.25rem 0.75rem',
                                    background: agency.status === 'active' ? '#10b98120' : '#64748b20',
                                    color: agency.status === 'active' ? '#10b981' : '#64748b',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                }}>
                                    {agency.status}
                                </div>
                            </div>

                            {/* Stats */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '1rem',
                                marginBottom: '1rem',
                            }}>
                                <div style={{
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    borderRadius: '8px',
                                }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                        Customers
                                    </div>
                                    <div style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: '700' }}>
                                        {agency.customerCount}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    borderRadius: '8px',
                                }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                        Credits
                                    </div>
                                    <div style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: '700' }}>
                                        ${agency.credits.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div style={{
                                padding: '0.75rem',
                                background: '#0f172a',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                            }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                    Pricing
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                                    <span>${agency.call_rate_per_minute}/min</span>
                                    <span>${agency.sms_rate}/SMS</span>
                                    <span>${agency.number_monthly_fee}/mo</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: '#334155',
                                        border: '1px solid #475569',
                                        borderRadius: '6px',
                                        color: '#f1f5f9',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(agency.id)}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '6px',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #334155',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: '700' }}>
                                Create New Agency
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreate} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        Agency Name *
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

                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        Billing Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.billing_email}
                                        onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
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

                            {/* Modal Footer */}
                            <div style={{
                                marginTop: '1.5rem',
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end',
                            }}>
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
                                    Create Agency
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agencies;
