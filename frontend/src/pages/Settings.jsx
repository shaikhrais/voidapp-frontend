import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Key, CreditCard, Plus, Trash2, Copy } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('team');
    const [keys, setKeys] = useState([]);
    const [team, setTeam] = useState([]); // Mock team for now
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'keys') fetchKeys();
    }, [activeTab]);

    const fetchKeys = async () => {
        try {
            const response = await api.get('/keys');
            setKeys(response.data);
        } catch (error) {
            console.error('Error fetching keys', error);
        }
    };

    const createKey = async () => {
        try {
            await api.post('/keys', { name: `Key ${keys.length + 1}` });
            fetchKeys();
        } catch (error) {
            alert('Failed to create key');
        }
    };

    const deleteKey = async (id) => {
        if (!window.confirm('Revoke this key?')) return;
        try {
            await api.delete(`/keys/${id}`);
            fetchKeys();
        } catch (error) {
            alert('Failed to delete key');
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await api.post('/organizations/invite', { email: inviteEmail });
            alert('Invitation sent!');
            setInviteEmail('');
        } catch (error) {
            alert('Failed to send invitation');
        }
    };

    const handleCheckout = async () => {
        try {
            const response = await api.post('/billing/checkout', { amount: 10 });
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            alert('Failed to start checkout');
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>Settings</h2>

            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
                {['team', 'keys', 'billing'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                            color: activeTab === tab ? '#2563eb' : '#6b7280',
                            fontWeight: '500',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'team' && (
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} /> Team Management
                    </h3>
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="email"
                                placeholder="colleague@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            />
                            <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                Invite
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'keys' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Key size={20} /> API Keys
                        </h3>
                        <button onClick={createKey} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={16} /> Generate Key
                        </button>
                    </div>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        {keys.length === 0 ? (
                            <p style={{ padding: '1.5rem', color: '#6b7280', textAlign: 'center' }}>No active API keys.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Name</th>
                                        <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Key Prefix</th>
                                        <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Created</th>
                                        <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keys.map((key) => (
                                        <tr key={key.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '1rem' }}>{key.name}</td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{key.key.substring(0, 8)}...</td>
                                            <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(key.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <button onClick={() => deleteKey(key.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'billing' && (
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={20} /> Billing
                    </h3>
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <p style={{ marginBottom: '1rem', color: '#4b5563' }}>Add credits to your account to make calls and send SMS.</p>
                        <button onClick={handleCheckout} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
                            Add $10 Credits
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
