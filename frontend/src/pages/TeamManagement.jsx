import React, { useEffect, useState } from 'react';
import { Plus, Users, Mail, Shield, X, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';

const TeamManagement = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [creationMethod, setCreationMethod] = useState('create'); // 'invite' or 'create'
    const [inviteData, setInviteData] = useState({
        email: '',
        role: 'user',
        full_name: '',
        password: '',
    });
    const [createdUser, setCreatedUser] = useState(null); // Store created user info

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const response = await api.get('/business/team');
            setTeam(response.data.team);
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            if (creationMethod === 'create') {
                // Direct user creation
                const response = await api.post('/business/team/create', {
                    email: inviteData.email,
                    role: inviteData.role,
                    full_name: inviteData.full_name,
                    password: inviteData.password || undefined
                });
                setCreatedUser(response.data.user);
                alert(response.data.message);
                fetchTeam(); // Refresh team list
            } else {
                // Invitation method
                const response = await api.post('/business/team/invite', {
                    email: inviteData.email,
                    role: inviteData.role
                });
                alert(`Invitation sent! Link: ${response.data.invitationLink}`);
            }
            setShowInviteModal(false);
            setInviteData({ email: '', role: 'user', full_name: '', password: '' });
        } catch (error) {
            console.error('Error inviting user:', error);
            alert(error.response?.data?.error || 'Failed to send invitation');
        }
    };

    const handleUpdatePermissions = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/business/team/${selectedMember.id}`, {
                can_make_calls: selectedMember.can_make_calls,
                can_send_sms: selectedMember.can_send_sms,
                can_buy_numbers: selectedMember.can_buy_numbers,
                can_manage_users: selectedMember.can_manage_users,
                can_view_billing: selectedMember.can_view_billing,
            });
            setShowEditModal(false);
            fetchTeam();
        } catch (error) {
            console.error('Error updating permissions:', error);
            alert('Failed to update permissions');
        }
    };

    const handleRemove = async (userId) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;

        try {
            await api.delete(`/business/team/${userId}`);
            fetchTeam();
        } catch (error) {
            console.error('Error removing member:', error);
            alert(error.response?.data?.error || 'Failed to remove member');
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
                        Team Management
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Manage your team members and their permissions
                    </p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
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
                    Invite Member
                </button>
            </div>

            {/* Team List */}
            <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '1.5rem' }}>
                    Team Members ({team.length})
                </h2>
                {team.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No team members yet</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {team.map((member) => (
                            <div
                                key={member.id}
                                style={{
                                    padding: '1.5rem',
                                    background: '#0f172a',
                                    borderRadius: '8px',
                                    border: '1px solid #334155',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                                            {member.full_name || member.email}
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                            {member.email}
                                        </div>
                                        <div style={{
                                            marginTop: '0.5rem',
                                            padding: '0.25rem 0.75rem',
                                            background: member.role === 'business_admin' ? '#667eea20' : '#64748b20',
                                            color: member.role === 'business_admin' ? '#667eea' : '#94a3b8',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            display: 'inline-block',
                                        }}>
                                            {member.role === 'business_admin' ? 'Admin' : 'User'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => {
                                                setSelectedMember(member);
                                                setShowEditModal(true);
                                            }}
                                            style={{
                                                padding: '0.5rem',
                                                background: '#334155',
                                                border: '1px solid #475569',
                                                borderRadius: '6px',
                                                color: '#f1f5f9',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        {member.role !== 'business_admin' && (
                                            <button
                                                onClick={() => handleRemove(member.id)}
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
                                        )}
                                    </div>
                                </div>

                                {/* Permissions */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                                    {[
                                        { key: 'can_make_calls', label: 'Make Calls' },
                                        { key: 'can_send_sms', label: 'Send SMS' },
                                        { key: 'can_buy_numbers', label: 'Buy Numbers' },
                                        { key: 'can_manage_users', label: 'Manage Users' },
                                        { key: 'can_view_billing', label: 'View Billing' },
                                    ].map((perm) => (
                                        <div
                                            key={perm.key}
                                            onClick={async () => {
                                                // Toggle permission instantly
                                                const newValue = member[perm.key] ? 0 : 1;
                                                try {
                                                    await api.put(`/business/team/${member.id}`, {
                                                        [perm.key]: newValue
                                                    });
                                                    // Update local state
                                                    fetchTeam();
                                                } catch (error) {
                                                    console.error('Error updating permission:', error);
                                                    alert('Failed to update permission');
                                                }
                                            }}
                                            style={{
                                                padding: '0.5rem',
                                                background: member[perm.key] ? '#10b98120' : '#64748b20',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: '1px solid transparent',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = member[perm.key] ? '#10b981' : '#64748b';
                                                e.currentTarget.style.transform = 'scale(1.02)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'transparent';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: member[perm.key] ? '#10b981' : '#64748b',
                                            }} />
                                            <span style={{
                                                color: member[perm.key] ? '#10b981' : '#94a3b8',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                            }}>
                                                {perm.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
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
                                Invite Team Member
                            </h2>
                            <button onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleInvite} style={{ padding: '1.5rem' }}>
                            {/* Method Toggle */}
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginBottom: '1.5rem',
                                background: '#0f172a',
                                padding: '0.25rem',
                                borderRadius: '8px'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setCreationMethod('create')}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: creationMethod === 'create' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ✨ Create Directly
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCreationMethod('invite')}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: creationMethod === 'invite' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    📧 Send Invite
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={inviteData.email}
                                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
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

                                {creationMethod === 'create' && (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={inviteData.full_name}
                                                onChange={(e) => setInviteData({ ...inviteData, full_name: e.target.value })}
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
                                                Password (leave empty for auto-generated)
                                            </label>
                                            <input
                                                type="text"
                                                value={inviteData.password}
                                                onChange={(e) => setInviteData({ ...inviteData, password: e.target.value })}
                                                placeholder="Auto-generate if empty"
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
                                            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                Leave empty to auto-generate a temporary password
                                            </p>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        Role *
                                    </label>
                                    <select
                                        value={inviteData.role}
                                        onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: '#0f172a',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#f1f5f9',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        <option value="user">User</option>
                                        <option value="business_admin">Admin</option>
                                    </select>
                                </div>

                                {creationMethod === 'create' && (
                                    <div style={{
                                        padding: '1rem',
                                        background: '#10b98110',
                                        border: '1px solid #10b98130',
                                        borderRadius: '8px',
                                        color: '#10b981',
                                        fontSize: '0.875rem'
                                    }}>
                                        ✨ User will be created immediately and can login right away!
                                    </div>
                                )}

                                {creationMethod === 'invite' && (
                                    <div style={{
                                        padding: '1rem',
                                        background: '#3b82f610',
                                        border: '1px solid #3b82f630',
                                        borderRadius: '8px',
                                        color: '#3b82f6',
                                        fontSize: '0.875rem'
                                    }}>
                                        📧 User will receive an invitation link to complete registration
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
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
                                    {creationMethod === 'create' ? '✨ Create User' : '📧 Send Invitation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Permissions Modal */}
            {showEditModal && selectedMember && (
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
                                Edit Permissions
                            </h2>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePermissions} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { key: 'can_make_calls', label: 'Can Make Calls' },
                                    { key: 'can_send_sms', label: 'Can Send SMS' },
                                    { key: 'can_buy_numbers', label: 'Can Buy Numbers' },
                                    { key: 'can_manage_users', label: 'Can Manage Users' },
                                    { key: 'can_view_billing', label: 'Can View Billing' },
                                ].map((perm) => (
                                    <label
                                        key={perm.key}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            background: '#0f172a',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMember[perm.key] === 1}
                                            onChange={(e) => setSelectedMember({
                                                ...selectedMember,
                                                [perm.key]: e.target.checked ? 1 : 0
                                            })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                                            {perm.label}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
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
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;
