import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, UserPlus, Settings as SettingsIcon, Phone } from 'lucide-react';
import api from '../services/api';

const TeamManagement = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/teams');
            setTeams(response.data.teams || []);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setMessage({ type: 'error', text: 'Failed to load teams' });
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamMembers = async (teamId) => {
        try {
            const response = await api.get(`/teams/${teamId}/members`);
            setTeamMembers(response.data.members || []);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleCreateTeam = async (teamData) => {
        try {
            await api.post('/teams', teamData);
            setMessage({ type: 'success', text: 'Team created successfully!' });
            fetchTeams();
            setShowCreateModal(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error creating team:', error);
            setMessage({ type: 'error', text: 'Failed to create team' });
        }
    };

    const handleUpdateTeam = async (teamId, teamData) => {
        try {
            await api.put(`/teams/${teamId}`, teamData);
            setMessage({ type: 'success', text: 'Team updated successfully!' });
            fetchTeams();
            setEditingTeam(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error updating team:', error);
            setMessage({ type: 'error', text: 'Failed to update team' });
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!confirm('Are you sure you want to delete this team?')) return;

        try {
            await api.delete(`/teams/${teamId}`);
            setMessage({ type: 'success', text: 'Team deleted successfully!' });
            fetchTeams();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error deleting team:', error);
            setMessage({ type: 'error', text: 'Failed to delete team' });
        }
    };

    const handleViewMembers = (team) => {
        setSelectedTeam(team);
        fetchTeamMembers(team.id);
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <p>Loading teams...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Users size={32} color="#3b82f6" />
                            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                                Team Management
                            </h1>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <Plus size={20} />
                            Create Team
                        </button>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                        Manage teams and call distribution for your organization
                    </p>
                </div>

                {/* Message */}
                {message.text && (
                    <div style={{
                        padding: '1rem',
                        background: message.type === 'success' ? '#10b98120' : '#ef444420',
                        border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                        borderRadius: '8px',
                        color: message.type === 'success' ? '#10b981' : '#ef4444',
                        marginBottom: '2rem',
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Teams Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {teams.map((team) => (
                        <div key={team.id} style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: '1px solid #334155',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                                        {team.name}
                                    </h3>
                                    {team.description && (
                                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                            {team.description}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setEditingTeam(team)}
                                        style={{
                                            padding: '0.5rem',
                                            background: '#334155',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#94a3b8',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTeam(team.id)}
                                        style={{
                                            padding: '0.5rem',
                                            background: '#334155',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                    Distribution Strategy
                                </div>
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    background: '#0f172a',
                                    borderRadius: '6px',
                                    color: '#3b82f6',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    textTransform: 'capitalize',
                                }}>
                                    {team.distribution_strategy.replace('_', ' ')}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Max Queue</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#f1f5f9' }}>{team.max_queue_size}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ring Timeout</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#f1f5f9' }}>{team.ring_timeout}s</div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleViewMembers(team)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#334155',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#f1f5f9',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <UserPlus size={18} />
                                Manage Members
                            </button>
                        </div>
                    ))}
                </div>

                {teams.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: '#1e293b',
                        borderRadius: '16px',
                        border: '1px solid #334155',
                    }}>
                        <Users size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                            No teams yet
                        </h3>
                        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                            Create your first team to start managing call distribution
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <Plus size={20} />
                            Create Team
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingTeam) && (
                <TeamModal
                    team={editingTeam}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingTeam(null);
                    }}
                    onSave={(data) => {
                        if (editingTeam) {
                            handleUpdateTeam(editingTeam.id, data);
                        } else {
                            handleCreateTeam(data);
                        }
                    }}
                />
            )}

            {/* Members Modal */}
            {selectedTeam && (
                <MembersModal
                    team={selectedTeam}
                    members={teamMembers}
                    onClose={() => setSelectedTeam(null)}
                    onRefresh={() => fetchTeamMembers(selectedTeam.id)}
                />
            )}
        </div>
    );
};

// Team Create/Edit Modal Component
const TeamModal = ({ team, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: team?.name || '',
        description: team?.description || '',
        distribution_strategy: team?.distribution_strategy || 'round_robin',
        max_queue_size: team?.max_queue_size || 50,
        max_wait_time: team?.max_wait_time || 300,
        overflow_action: team?.overflow_action || 'voicemail',
        ring_timeout: team?.ring_timeout || 30,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }} onClick={onClose}>
            <div style={{
                background: '#1e293b',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: '1px solid #334155',
            }} onClick={(e) => e.stopPropagation()}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '1.5rem' }}>
                    {team ? 'Edit Team' : 'Create Team'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                            Team Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                            Distribution Strategy
                        </label>
                        <select
                            value={formData.distribution_strategy}
                            onChange={(e) => setFormData({ ...formData, distribution_strategy: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                            }}
                        >
                            <option value="round_robin">Round Robin</option>
                            <option value="longest_idle">Longest Idle</option>
                            <option value="simultaneous">Simultaneous Ring</option>
                            <option value="skills_based">Skills Based</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                Max Queue Size
                            </label>
                            <input
                                type="number"
                                value={formData.max_queue_size}
                                onChange={(e) => setFormData({ ...formData, max_queue_size: parseInt(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#f1f5f9',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                Ring Timeout (s)
                            </label>
                            <input
                                type="number"
                                value={formData.ring_timeout}
                                onChange={(e) => setFormData({ ...formData, ring_timeout: parseInt(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#f1f5f9',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: '#334155',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            {team ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Members Modal Component (Placeholder)
const MembersModal = ({ team, members, onClose, onRefresh }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }} onClick={onClose}>
            <div style={{
                background: '#1e293b',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: '1px solid #334155',
            }} onClick={(e) => e.stopPropagation()}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '1.5rem' }}>
                    {team.name} - Members
                </h2>

                {members.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No members yet. Add members to this team.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {members.map((member) => (
                            <div key={member.id} style={{
                                padding: '1rem',
                                background: '#0f172a',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <div>
                                    <div style={{ color: '#f1f5f9', fontWeight: '600' }}>{member.name || member.email}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{member.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#334155',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '1.5rem',
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default TeamManagement;
