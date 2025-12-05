import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ArrowLeft } from 'lucide-react';

const BuyNumber = () => {
    const [country, setCountry] = useState('US');
    const [availableNumbers, setAvailableNumbers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [purchasing, setPurchasing] = useState(null);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.get(`/numbers/available/${country}`);
            setAvailableNumbers(response.data);
        } catch (error) {
            alert('Failed to search numbers');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (phoneNumber) => {
        if (!window.confirm(`Buy ${phoneNumber}?`)) return;
        setPurchasing(phoneNumber);
        try {
            await api.post('/numbers/purchase', { phoneNumber });
            alert('Number purchased successfully!');
            navigate('/dashboard/numbers');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to purchase number');
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard/numbers')} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280', marginBottom: '1rem'
                }}>
                    <ArrowLeft size={20} /> Back to My Numbers
                </button>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Buy Phone Number</h2>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '150px' }}
                    >
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                    </select>
                    <button type="submit" disabled={loading} style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: loading ? 0.7 : 1
                    }}>
                        <Search size={20} />
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {availableNumbers.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {availableNumbers.map((num) => (
                        <div key={num.phoneNumber} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>{num.friendlyName}</p>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{num.locality}, {num.region}</p>
                            </div>
                            <button
                                onClick={() => handlePurchase(num.phoneNumber)}
                                disabled={purchasing === num.phoneNumber}
                                style={{
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    opacity: purchasing === num.phoneNumber ? 0.7 : 1
                                }}
                            >
                                <ShoppingCart size={18} />
                                {purchasing === num.phoneNumber ? 'Buying...' : 'Buy'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuyNumber;
