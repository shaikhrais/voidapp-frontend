import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Phone, PhoneCall, MessageSquare, Settings, LogOut, User, Menu, Shield, Building2 } from 'lucide-react';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/dashboard/dialer', label: 'Dialer', icon: PhoneCall },
        { path: '/dashboard/numbers', label: 'Phone Numbers', icon: Phone },
        { path: '/dashboard/calls', label: 'Call Logs', icon: PhoneCall },
        { path: '/dashboard/sms', label: 'SMS Logs', icon: MessageSquare },
        { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    // Add admin menu items ONLY for super admin (org-super-admin)
    const adminItems = (user?.role === 'super_admin') ? [
        { path: '/dashboard/admin', label: 'Admin Dashboard', icon: Shield },
        { path: '/dashboard/admin/agencies', label: 'Agencies', icon: Building2 },
    ] : [];

    // Add agency menu items for agency admins only
    const agencyItems = (user?.role === 'agency_admin') ? [
        { path: '/dashboard/agency', label: 'Agency Dashboard', icon: Building2 },
    ] : [];

    // Add team management for business and agency admins (not super admin)
    const businessItems = (user?.role === 'business_admin' || user?.role === 'agency_admin') ? [
        { path: '/dashboard/team', label: 'Team Management', icon: Users },
    ] : [];

    const allNavItems = [...adminItems, ...agencyItems, ...businessItems, ...navItems];

    // Debug logging
    console.log('=== USER DEBUG ===');
    console.log('Full user object:', user);
    console.log('Role:', user?.role);
    console.log('Organization ID:', user?.organization_id);
    console.log('Admin items shown:', adminItems.length > 0);
    console.log('Agency items shown:', agencyItems.length > 0);
    console.log('Business items shown:', businessItems.length > 0);
    console.log('==================');

    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            background: '#0f172a',
        },
        sidebar: {
            width: sidebarOpen ? '280px' : '80px',
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            borderRight: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.2s',
            flexShrink: 0,
        },
        sidebarHeader: {
            padding: '1.5rem',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        logo: {
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
        nav: {
            flex: 1,
            padding: '1.5rem 1rem',
            overflowY: 'auto',
        },
        navList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        navItem: {
            marginBottom: '0.5rem',
        },
        navLink: (isActive) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '0.875rem 1rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            color: isActive ? 'white' : '#cbd5e1',
            background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            fontWeight: isActive ? '600' : '500',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
        }),
        navIcon: {
            marginRight: sidebarOpen ? '0.875rem' : '0',
            flexShrink: 0,
        },
        navLabel: {
            opacity: sidebarOpen ? 1 : 0,
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap',
        },
        userSection: {
            padding: '1rem',
            borderTop: '1px solid #334155',
        },
        userCard: {
            background: '#334155',
            borderRadius: '0.75rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
        },
        avatar: {
            width: '40px',
            height: '40px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        },
        userInfo: {
            flex: 1,
            minWidth: 0,
            opacity: sidebarOpen ? 1 : 0,
            transition: 'opacity 0.2s',
        },
        userName: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#f1f5f9',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        userEmail: {
            fontSize: '0.75rem',
            color: '#94a3b8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        logoutBtn: {
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        main: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            width: '100%',
        },
        header: {
            background: '#1e293b',
            borderBottom: '1px solid #334155',
            padding: '1.25rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#f1f5f9',
        },
        content: {
            flex: 1,
            padding: '2rem',
            overflowY: 'auto',
            background: '#0f172a',
            width: '100%',
        },
        menuBtn: {
            background: '#334155',
            border: 'none',
            color: '#f1f5f9',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
        },
    };

    const getPageTitle = () => {
        const item = navItems.find(item => item.path === location.pathname);
        return item ? item.label : 'Dashboard';
    };

    return (
        <div style={styles.container} className="animate-fade-in">
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h1 style={styles.logo}>{sidebarOpen ? 'VOIP SaaS' : 'VS'}</h1>
                    <button
                        style={styles.menuBtn}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#6366f1'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
                    >
                        <Menu size={20} />
                    </button>
                </div>

                <nav style={styles.nav}>
                    <ul style={styles.navList}>
                        {allNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path} style={styles.navItem}>
                                    <Link
                                        to={item.path}
                                        style={styles.navLink(isActive)}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = '#334155';
                                                e.currentTarget.style.transform = 'translateX(4px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                            }
                                        }}
                                    >
                                        <Icon size={20} style={styles.navIcon} />
                                        <span style={styles.navLabel}>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={styles.userSection}>
                    <div style={styles.userCard}>
                        <div style={styles.avatar}>
                            <User size={20} color="white" />
                            style={styles.logoutBtn}
                            onClick={handleLogout}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                                e.currentTarget.style.color = '#cbd5e1';
                            }}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <h2 style={styles.headerTitle}>{getPageTitle()}</h2>
                </header>
                <div style={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
