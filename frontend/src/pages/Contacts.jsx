import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Star, Phone, MessageSquare, Edit, Trash2, X } from 'lucide-react';
import api from '../services/api';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        company: '',
        notes: '',
        favorite: false
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/contacts');
            setContacts(response.data.contacts || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            fetchContacts();
            return;
        }

        try {
            const response = await api.get(`/contacts/search?q=${encodeURIComponent(query)}`);
            setContacts(response.data.contacts || []);
        } catch (error) {
            console.error('Error searching contacts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingContact) {
                await api.put(`/contacts/${editingContact.id}`, formData);
            } else {
                await api.post('/contacts', formData);
            }
            setShowForm(false);
            setEditingContact(null);
            resetForm();
            fetchContacts();
        } catch (error) {
            console.error('Error saving contact:', error);
            alert(error.response?.data?.error || 'Failed to save contact');
        }
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData({
            first_name: contact.first_name,
            last_name: contact.last_name || '',
            phone_number: contact.phone_number,
            email: contact.email || '',
            company: contact.company || '',
            notes: contact.notes || '',
            favorite: contact.favorite === 1
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            await api.delete(`/contacts/${id}`);
            fetchContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const toggleFavorite = async (id) => {
        try {
            await api.post(`/contacts/${id}/favorite`);
            fetchContacts();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            phone_number: '',
            email: '',
            company: '',
            notes: '',
            favorite: false
        });
    };

    const handleCall = (phoneNumber) => {
        navigate('/dashboard/dialer', { state: { phoneNumber } });
    };

    const handleSms = (phoneNumber) => {
        navigate('/dashboard/messages', { state: { toNumber: phoneNumber } });
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading contacts...</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                    Contacts
                </h1>
                <button
                    onClick={() => { resetForm(); setEditingContact(null); setShowForm(true); }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Plus size={20} />
                    Add Contact
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ position: 'relative', maxWidth: '500px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem 0.875rem 3rem',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#f1f5f9',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Contacts Grid */}
            {contacts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    <Users size={64} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.125rem' }}>No contacts found</p>
                    <p>Add your first contact to get started</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {contacts.map((contact) => (
                        <div
                            key={contact.id}
                            style={{
                                background: '#1e293b',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                border: '1px solid #334155',
                                position: 'relative'
                            }}
                        >
                            {/* Favorite Star */}
                            <button
                                onClick={() => toggleFavorite(contact.id)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                }}
                            >
                                <Star
                                    size={20}
                                    fill={contact.favorite ? '#fbbf24' : 'none'}
                                    color={contact.favorite ? '#fbbf24' : '#64748b'}
                                />
                            </button>

                            {/* Avatar */}
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: 'white',
                                marginBottom: '1rem'
                            }}>
                                {getInitials(contact.first_name, contact.last_name)}
                            </div>

                            {/* Name */}
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                                {contact.first_name} {contact.last_name}
                            </h3>

                            {/* Phone */}
                            <p style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>{contact.phone_number}</p>

                            {/* Email */}
                            {contact.email && (
                                <p style={{ color: '#94a3b8', marginBottom: '0.25rem', fontSize: '0.875rem' }}>{contact.email}</p>
                            )}

                            {/* Company */}
                            {contact.company && (
                                <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.875rem' }}>{contact.company}</p>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => handleCall(contact.phone_number)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: '#10b981',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    title="Call"
                                >
                                    <Phone size={16} />
                                </button>
                                <button
                                    onClick={() => handleSms(contact.phone_number)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: '#3b82f6',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    title="SMS"
                                >
                                    <MessageSquare size={16} />
                                </button>
                                <button
                                    onClick={() => handleEdit(contact)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: '#64748b',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    title="Edit"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(contact.id)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: '#ef4444',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Contact Form Modal */}
            {showForm && (
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
                    padding: '1rem'
                }}>
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                                {editingContact ? 'Edit Contact' : 'New Contact'}
                            </h2>
                            <button
                                onClick={() => { setShowForm(false); setEditingContact(null); }}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.favorite}
                                        onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Mark as favorite</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {editingContact ? 'Update Contact' : 'Create Contact'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contacts;
