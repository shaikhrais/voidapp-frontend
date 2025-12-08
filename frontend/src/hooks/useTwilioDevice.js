// Custom Hook: Twilio Device Management
// Handles Twilio Voice SDK device initialization and lifecycle

import { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import api from '../../services/api';

export function useTwilioDevice() {
    const [device, setDevice] = useState(null);
    const [deviceReady, setDeviceReady] = useState(false);
    const [deviceError, setDeviceError] = useState(null);
    const deviceRef = useRef(null);

    useEffect(() => {
        initializeDevice();

        return () => {
            if (deviceRef.current) {
                deviceRef.current.destroy();
            }
        };
    }, []);

    const initializeDevice = async () => {
        try {
            console.log('🎤 Initializing Twilio Device...');

            const response = await api.get('/voice/token');
            const { token } = response.data;

            const newDevice = new Device(token, {
                logLevel: 1,
                codecPreferences: ['opus', 'pcmu'],
            });

            // Device event handlers
            newDevice.on('registered', () => {
                console.log('✅ Twilio Device registered');
                setDeviceReady(true);
            });

            newDevice.on('error', (error) => {
                console.error('❌ Twilio Device error:', error);
                setDeviceError(error.message);
            });

            newDevice.on('unregistered', () => {
                console.log('📴 Twilio Device unregistered');
                setDeviceReady(false);
            });

            await newDevice.register();

            deviceRef.current = newDevice;
            setDevice(newDevice);

            console.log('✅ Twilio Device initialized');
        } catch (error) {
            console.error('❌ Failed to initialize device:', error);
            setDeviceError(error.message);
        }
    };

    return {
        device,
        deviceReady,
        deviceError,
        reinitialize: initializeDevice
    };
}
