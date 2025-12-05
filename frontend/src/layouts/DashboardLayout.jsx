import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Phone, PhoneCall, MessageSquare, Settings, LogOut, User } from 'lucide-react';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/dashboard/numbers', label: 'Phone Numbers', icon: Phone },
        { path: '/dashboard/calls', label: 'Call Logs', icon: PhoneCall },
        { path: '/dashboard/sms', label: 'SMS Logs', icon: MessageSquare },
        { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            {/* Sidebar */}
            <aside style={{ width: '250px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>VOIP SaaS</h1>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                                    <Link to={item.path} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        color: isActive ? '#2563eb' : '#4b5563',
                                        backgroundColor: isActive ? '#eff6ff' : 'transparent',
                                        fontWeight: isActive ? '500' : 'normal'
                                    }}>
                                        <Icon size={20} style={{ marginRight: '0.75rem' }} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', padding: '0 1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem' }}>
                            <User size={16} color="#6b7280" />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s'
                    }}>
                        <LogOut size={20} style={{ marginRight: '0.75rem' }} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
