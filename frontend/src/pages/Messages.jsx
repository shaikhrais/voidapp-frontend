import React from 'react';
import { useLocation } from 'react-router-dom';
import MessageComposer from '../components/MessageComposer';

const Messages = () => {
    const location = useLocation();
    const toNumber = location.state?.toNumber || '';

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <MessageComposer initialToNumber={toNumber} />
        </div>
    );
};

export default Messages;
