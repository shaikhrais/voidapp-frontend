import React, { useState, useEffect } from 'react';
import { Monitor, Users, Phone, Clock, TrendingUp, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const QueueMonitor = () => {
    const [queue, setQueue] = useState([]);
    const [agents, setAgents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [stats, setStats] = useState({
        totalInQueue: 0,
        availableAgents: 0,
        avgWaitTime: 0,
        callsToday: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeams();
        fetchData();

        // Refresh every 3 seconds
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [selectedTeam]);

    const fetchTeams = async () => {
        try {
            const response = await api.get('/teams');
            setTeams(response.data.teams || []);
            if (response.data.teams?.length > 0 && !selectedTeam) {
                setSelectedTeam(response.data.teams[0].id);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const fetchData = async () => {
        try {
            // Fetch queue
            const queueResponse = await api.get('/teams/queue');
            const allQueue = queueResponse.data.queue || [];
            setQueue(selectedTeam ? allQueue.filter(q => q.team_id === selectedTeam) : allQueue);

            // Fetch agent statuses
            const agentsResponse = await api.get('/teams/agents/status');
            setAgents(agentsResponse.data.agents || []);

            // Calculate stats
            const availableCount = (agentsResponse.data.agents || []).filter(a => a.status === 'available').length;
            const avgWait = allQueue.length > 0
                ? allQueue.reduce((sum, q) => sum + (Date.now() / 1000 - q.entered_at), 0) / allQueue.length
                : 0;

            setStats({
                totalInQueue: allQueue.length,
                availableAgents: availableCount,
                avgWaitTime: Math.floor(avgWait),
                callsToday: agentsResponse.data.agents?.reduce((sum, a) => sum + (a.total_calls_today || 0), 0) || 0
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleManualAssign = async (queueId, agentId) => {
        try {
            await api.post('/teams/queue/assign', {
                queue_id: queueId,
                agent_id: agentId,
                entered_at: queue.find(q => q.id === queueId)?.entered_at
            });
            fetchData();
        } catch (error) {
            console.error('Error assigning call:', error);
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

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <p>Loading queue monitor...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem',
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Monitor size={32} color="#3b82f6" />
                            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                                Queue Monitor
                            </h1>
                        </div>
                        <select
                            value={selectedTeam || ''}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                background: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                                fontWeight: '600',
                            }}
                        >
                            <option value="">All Teams</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                        Real-time call queue and agent monitoring
                    </p>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Queue Depth</div>
                            <Phone size={20} color="#f59e0b" />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f1f5f9' }}>
                            {stats.totalInQueue}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            Callers waiting
                        </div>
                    </div>

                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Available Agents</div>
                            <UserCheck size={20} color="#10b981" />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f1f5f9' }}>
                            {stats.availableAgents}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            Ready for calls
                        </div>
                    </div>

                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Avg Wait Time</div>
                            <Clock size={20} color="#3b82f6" />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f1f5f9' }}>
                            {Math.floor(stats.avgWaitTime / 60)}:{(stats.avgWaitTime % 60).toString().padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            Minutes
                        </div>
                    </div>

                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Calls Today</div>
                            <TrendingUp size={20} color="#8b5cf6" />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f1f5f9' }}>
                            {stats.callsToday}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            Total handled
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflow: 'auto' }}>
                                {queue.map((call, index) => (
                                    <div key={call.id} style={{
                                        padding: '1rem',
                                        background: '#0f172a',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: '#3b82f620',
                                                    border: '2px solid #3b82f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#3b82f6',
                                                    fontWeight: '700',
                                                    fontSize: '0.875rem',
                                                }}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div style={{ color: '#f1f5f9', fontWeight: '600' }}>
                                                        {call.caller_number}
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                        {call.team_name || 'General'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: '#f59e0b', fontWeight: '600' }}>
                                                    {Math.floor((Date.now() / 1000 - call.entered_at) / 60)}m {Math.floor((Date.now() / 1000 - call.entered_at) % 60)}s
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                    Waiting
                                                </div>
                                            </div>
                                        </div>
                                        <select
                                            onChange={(e) => handleManualAssign(call.id, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                background: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '6px',
                                                color: '#f1f5f9',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            <option value="">Assign to agent...</option>
                                            {agents.filter(a => a.status === 'available').map((agent) => (
                                                <option key={agent.user_id} value={agent.user_id}>
                                                    {agent.name || agent.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Agent Status Grid */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem' }}>
                            Agent Status
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflow: 'auto' }}>
                            {agents.map((agent) => (
                                <div key={agent.user_id} style={{
                                    padding: '1rem',
                                    background: '#0f172a',
                                    borderRadius: '12px',
                                    border: `1px solid ${getStatusColor(agent.status)}40`,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: getStatusColor(agent.status),
                                            }} />
                                            <div>
                                                <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '0.875rem' }}>
                                                    {agent.name || agent.email}
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                                    {agent.status}
                                                    {agent.status_message && ` - ${agent.status_message}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '0.875rem' }}>
                                                {agent.total_calls_today || 0}
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                Calls today
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueueMonitor;
