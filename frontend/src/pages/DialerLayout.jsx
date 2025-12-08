import React, { useState } from 'react';
import DialerWidget from '../components/DialerWidget';
import RecentCallsWidget from '../components/RecentCallsWidget';

const DialerLayout = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCallLogged = () => {
        // Trigger refresh of recent calls when a new call is logged
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '1.5rem',
        }}>
            <DialerWidget onCallLogged={handleCallLogged} />
            <RecentCallsWidget refreshTrigger={refreshTrigger} />
        </div>
    );
};

export default DialerLayout;
