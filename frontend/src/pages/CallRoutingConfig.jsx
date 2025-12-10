import React, { useState, useEffect } from 'react';
import { Settings, Download, Upload, Save, RefreshCw } from 'lucide-react';
import api from '../services/api';

const CallRoutingConfig = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await api.get('/routing/config');
            setConfig(response.data.config);
        } catch (error) {
            console.error('Error fetching config:', error);
            setMessage({ type: 'error', text: 'Failed to load configuration' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put('/routing/config', config);
            setMessage({ type: 'success', text: 'Configuration saved successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error saving config:', error);
            setMessage({ type: 'error', text: 'Failed to save configuration' });
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/routing/export');
            const dataStr = JSON.stringify(response.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `call-routing-config-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            setMessage({ type: 'success', text: 'Configuration exported!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error exporting config:', error);
            setMessage({ type: 'error', text: 'Failed to export configuration' });
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                const text = await file.text();
                const importedConfig = JSON.parse(text);
                await api.post('/routing/import', importedConfig);
                await fetchConfig();
                setMessage({ type: 'success', text: 'Configuration imported successfully!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                console.error('Error importing config:', error);
                setMessage({ type: 'error', text: 'Failed to import configuration' });
            }
        };
        input.click();
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '1rem' }}>Loading configuration...</p>
            </div>
        );
    }

    if (!config) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem',
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Settings size={32} color="#3b82f6" />
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                            Call Routing Configuration
                        </h1>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                        Configure how incoming calls are routed and handled
                    </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontWeight: '600',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={handleExport}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#334155',
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
                        <Download size={18} />
                        Export JSON
                    </button>
                    <button
                        onClick={handleImport}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#334155',
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
                        <Upload size={18} />
                        Import JSON
                    </button>
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

                {/* Configuration Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Routing Mode */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem' }}>
                            Routing Strategy
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { value: 'simultaneous', label: 'Simultaneous Ring', desc: 'Ring all devices at once' },
                                { value: 'sequential', label: 'Sequential Ring', desc: 'Try devices one by one' },
                                { value: 'ai_first', label: 'AI First', desc: 'AI answers, can transfer to human' },
                                { value: 'ai_only', label: 'AI Only', desc: 'Fully automated, no human' },
                            ].map((mode) => (
                                <label key={mode.value} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    background: config.routing_mode === mode.value ? '#3b82f620' : '#0f172a',
                                    border: `1px solid ${config.routing_mode === mode.value ? '#3b82f6' : '#334155'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}>
                                    <input
                                        type="radio"
                                        name="routing_mode"
                                        value={mode.value}
                                        checked={config.routing_mode === mode.value}
                                        onChange={(e) => setConfig({ ...config, routing_mode: e.target.value })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <div>
                                        <div style={{ color: '#f1f5f9', fontWeight: '600' }}>{mode.label}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{mode.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Multi-Device Settings */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem' }}>
                            Multi-Device Settings
                        </h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={Boolean(config.ring_all_devices)}
                                onChange={(e) => setConfig({ ...config, ring_all_devices: e.target.checked })}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ color: '#f1f5f9' }}>Ring all logged-in devices</span>
                        </label>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                Ring Timeout (seconds)
                            </label>
                            <input
                                type="number"
                                value={config.ring_timeout}
                                onChange={(e) => setConfig({ ...config, ring_timeout: parseInt(e.target.value) })}
                                style={{
                                    width: '150px',
                                    padding: '0.5rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#f1f5f9',
                                }}
                            />
                        </div>
                    </div>

                    {/* AI Agent */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem' }}>
                            AI Agent
                        </h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={Boolean(config.ai_enabled)}
                                onChange={(e) => setConfig({ ...config, ai_enabled: e.target.checked })}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ color: '#f1f5f9' }}>Enable AI Agent</span>
                        </label>

                        {config.ai_enabled && (
                            <>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                        AI Provider
                                    </label>
                                    <select
                                        value={config.ai_provider || 'openai'}
                                        onChange={(e) => setConfig({ ...config, ai_provider: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            background: '#0f172a',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#f1f5f9',
                                        }}
                                    >
                                        <option value="openai">OpenAI Realtime API</option>
                                        <option value="dialogflow">Google Dialogflow</option>
                                        <option value="custom">Custom Webhook</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                        Greeting Message
                                    </label>
                                    <textarea
                                        value={config.ai_greeting || ''}
                                        onChange={(e) => setConfig({ ...config, ai_greeting: e.target.value })}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            background: '#0f172a',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#f1f5f9',
                                            fontFamily: 'inherit',
                                        }}
                                    />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(config.ai_can_transfer)}
                                        onChange={(e) => setConfig({ ...config, ai_can_transfer: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ color: '#f1f5f9' }}>Can transfer to human</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(config.ai_take_messages)}
                                        onChange={(e) => setConfig({ ...config, ai_take_messages: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ color: '#f1f5f9' }}>Take messages</span>
                                </label>
                            </>
                        )}
                    </div>

                    {/* Voicemail & Notifications */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #334155',
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem' }}>
                            Voicemail & Notifications
                        </h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={Boolean(config.voicemail_enabled)}
                                onChange={(e) => setConfig({ ...config, voicemail_enabled: e.target.checked })}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ color: '#f1f5f9' }}>Enable voicemail</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={Boolean(config.missed_call_sms)}
                                onChange={(e) => setConfig({ ...config, missed_call_sms: e.target.checked })}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ color: '#f1f5f9' }}>SMS notification for missed calls</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={Boolean(config.missed_call_email)}
                                onChange={(e) => setConfig({ ...config, missed_call_email: e.target.checked })}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ color: '#f1f5f9' }}>Email notification for missed calls</span>
                        </label>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CallRoutingConfig;
