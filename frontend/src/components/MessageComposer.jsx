import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import api from '../services/api';

const MessageComposer = ({ initialToNumber = '', onClose }) => {
    const [phoneNumber, setPhoneNumber] = useState(initialToNumber);
    const [message, setMessage] = useState('');
    const [selectedNumber, setSelectedNumber] = useState('');
    const [myNumbers, setMyNumbers] = useState([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchMyNumbers();
    }, []);

    useEffect(() => {
        setPhoneNumber(initialToNumber);
    }, [initialToNumber]);

    const fetchMyNumbers = async () => {
        try {
            const response = await api.get('/admin/numbers');
            setMyNumbers(response.data.numbers || []);
            if (response.data.numbers && response.data.numbers.length > 0) {
                setSelectedNumber(response.data.numbers[0].phone_number);
            }
        } catch (error) {
            console.error('Error fetching numbers:', error);
        }
    };

    const handleSend = async () => {
        if (!selectedNumber || !phoneNumber || !message.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setSending(true);
        setError('');

        try {
            await api.post('/messages/send', {
                from_number: selectedNumber,
                to_number: phoneNumber,
                body: message
            });

            setSuccess(true);
            setMessage('');
            setTimeout(() => {
                setSuccess(false);
                if (onClose) onClose();
            }, 2000);
        } catch (error) {
            console.error('Error sending message:', error);
            setError(error.response?.data?.error || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #334155',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MessageSquare size={24} color="#3b82f6" />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                        New Message
                    </h3>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '0.5rem',
                        }}
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* From Number Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    From
                </label>
                <select
                    value={selectedNumber}
                    onChange={(e) => setSelectedNumber(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        outline: 'none',
                    }}
                >
                    {myNumbers.map((num) => (
                        <option key={num.id} value={num.phone_number}>
                            {num.friendly_name || num.phone_number}
                        </option>
                    ))}
                </select>
            </div>

            {/* To Number */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    To
                </label>
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        outline: 'none',
                    }}
                />
            </div>

            {/* Message */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    Message
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                    maxLength={160}
                    style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                    }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'right' }}>
                    {message.length}/160
                </div>
            </div>

            {/* Error/Success */}
            {error && (
                <div style={{
                    padding: '0.75rem 1rem',
                    background: '#ef444420',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    padding: '0.75rem 1rem',
                    background: '#10b98120',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    color: '#10b981',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                }}>
                    ✅ Message sent successfully!
                </div>
            )}

            {/* Send Button */}
            <button
                onClick={handleSend}
                disabled={sending || !selectedNumber || !phoneNumber || !message.trim()}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: sending ? '#64748b' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                }}
            >
                <Send size={20} />
                {sending ? 'Sending...' : 'Send Message'}
            </button>
        </div>
    );
};

export default MessageComposer;
