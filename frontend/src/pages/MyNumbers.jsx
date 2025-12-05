import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Phone, Trash2, Edit2 } from 'lucide-react';

const MyNumbers = () => {
    const [numbers, setNumbers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNumbers();
    }, []);

    const fetchNumbers = async () => {
        try {
            const response = await api.get('/numbers');
            setNumbers(response.data);
        } catch (error) {
            console.error('Error fetching numbers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async (sid) => {
        if (!window.confirm('Are you sure you want to release this number? This cannot be undone.')) return;
        try {
            await api.delete(`/numbers/${sid}`);
            setNumbers(numbers.filter(n => n.sid !== sid));
        } catch (error) {
            alert('Failed to release number');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Phone Numbers</h2>
                <a href="/dashboard/numbers/buy" style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: '500'
                }}>
                    Buy Number
                </a>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {numbers.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                        <Phone size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>You don't have any phone numbers yet.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Phone Number</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Friendly Name</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Capabilities</th>
                                <th style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {numbers.map((number) => (
                                <tr key={number.sid} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500', color: '#111827' }}>{number.phoneNumber}</td>
                                    <td style={{ padding: '1rem', color: '#4b5563' }}>{number.friendlyName}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '9999px' }}>Voice</span>
                                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '9999px' }}>SMS</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleRelease(number.sid)} style={{
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '0.5rem',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Trash2 size={16} /> Release
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MyNumbers;
