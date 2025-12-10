import React, { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, Clock, CheckCircle, XCircle, AlertCircle, Users, TrendingUp } from 'lucide-react';
import api from '../services/api';

const AgentDashboard = () => {
    const [agentStatus, setAgentStatus] = useState('offline');
    const [statusMessage, setStatusMessage] = useState('');
    const [queue, setQueue] = useState([]);
    const [stats, setStats] = useState({
        callsToday: 0,
        activeCall: false,
        queuePosition: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgentStatus();
        fetchQueue();

        // Refresh every 5 seconds
        const interval = setInterval(() => {
            fetchQueue();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchAgentStatus = async () => {
        try {
            const response = await api.get('/teams/agents/status');
            const myStatus = response.data.agents?.find(a => a.user_id === localStorage.getItem('user_id'));
            if (myStatus) {
                setAgentStatus(myStatus.status);
                setStatusMessage(myStatus.status_message || '');
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQueue = async () => {
        try {
            const response = await api.get('/teams/queue');
            setQueue(response.data.queue || []);
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put('/teams/agents/status', {
                status: newStatus,
                status_message: statusMessage
            });
            setAgentStatus(newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return '#10b981';
            case 'busy': return '#ef4444';
            case 'away': return '#f59e0b';
            case 'offline': return '#64748b';
            default: return '#64748b';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'available': return <CheckCircle size={20} />;
            case 'busy': return <XCircle size={20} />;
            case 'away': return <Clock size={20} />;
            case 'offline': return <AlertCircle size={20} />;
            default: return <AlertCircle size={20} />;
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <p>Loading dashboard...</p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Phone size={32} color="#3b82f6" />
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                            Agent Dashboard
                        </h1>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                        Manage your availability and view incoming calls
                    </p>
                </div>

                {/* Status Selector */}
                <div style={{
                    background: '#1e293b',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid #334155',
                    marginBottom: '2rem',
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem' }}>
                        Your Status
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        {['available', 'busy', 'away', 'offline'].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                style={{
                                    padding: '1rem',
                                    background: agentStatus === status ? `${getStatusColor(status)}20` : '#0f172a',
                                    border: `2px solid ${agentStatus === status ? getStatusColor(status) : '#334155'}`,
                                    borderRadius: '12px',
                                    color: agentStatus === status ? getStatusColor(status) : '#94a3b8',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {getStatusIcon(status)}
                                {status}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                            Status Message (Optional)
                        </label>
                        <input
                            type="text"
                            value={statusMessage}
                            onChange={(e) => setStatusMessage(e.target.value)}
                            onBlur={() => handleStatusChange(agentStatus)}
                            placeholder="e.g., On lunch break, Back at 2 PM"
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

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Calls Today */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Calls Today</div>
                            <Phone size={20} color="#3b82f6" />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f1f5f9' }}>
                            {stats.callsToday}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                            <TrendingUp size={14} />
                            Active
                        </div>
                    </div>

                    {/* Queue Position */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Queue Depth</div>
                            <Users size={20} color="#f59e0b" />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f1f5f9' }}>
                            {queue.length}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            {queue.length > 0 ? 'Callers waiting' : 'No callers waiting'}
                        </div>
                    </div>

                    {/* Active Call */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Active Call</div>
                            <PhoneIncoming size={20} color={stats.activeCall ? '#10b981' : '#64748b'} />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: stats.activeCall ? '#10b981' : '#64748b' }}>
                            {stats.activeCall ? 'Yes' : 'No'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            {stats.activeCall ? 'In progress' : 'Ready for calls'}
                        </div>
                    </div>
                </div>

                {/* Call Queue */}
                <div style={{
                    background: '#1e293b',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid #334155',
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem' }}>
                        Call Queue
                    </h3>

                    {queue.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            <Phone size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <p>No calls in queue</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {queue.map((call, index) => (
                                <div key={call.id} style={{
                                    padding: '1rem',
                                    background: '#0f172a',
                                    borderRadius: '12px',
                                    border: '1px solid #334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: '#3b82f620',
                                            border: '2px solid #3b82f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#3b82f6',
                                            fontWeight: '700',
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '1rem' }}>
                                                {call.caller_number}
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                                {call.team_name || 'General Queue'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#f59e0b', fontWeight: '600', fontSize: '1rem' }}>
                                            {Math.floor((Date.now() / 1000 - call.entered_at) / 60)}m {Math.floor((Date.now() / 1000 - call.entered_at) % 60)}s
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            Wait time
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: '#1e293b',
                    borderRadius: '16px',
                    border: '1px solid #334155',
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem' }}>
                        Quick Actions
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => handleStatusChange('available')}
                            disabled={agentStatus === 'available'}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: agentStatus === 'available' ? '#64748b' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: agentStatus === 'available' ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Go Available
                        </button>
                        <button
                            onClick={() => handleStatusChange('away')}
                            disabled={agentStatus === 'away'}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: agentStatus === 'away' ? '#64748b' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: agentStatus === 'away' ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Take Break
                        </button>
                        <button
                            onClick={() => handleStatusChange('offline')}
                            disabled={agentStatus === 'offline'}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: agentStatus === 'offline' ? '#64748b' : '#334155',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: agentStatus === 'offline' ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Go Offline
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
