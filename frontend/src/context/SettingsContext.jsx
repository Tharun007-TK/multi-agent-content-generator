import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { settingsApi } from '../services/api';

const SettingsContext = createContext(undefined);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        default_llm_model: 'amazon/nova-micro-v1',
        // add other necessary settings defaults
    });
    const [loading, setLoading] = useState(true);

    const refreshSettings = useCallback(async () => {
        try {
            const response = await settingsApi.get();
            setSettings(response.data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSettings();
    }, [refreshSettings]);

    const value = {
        settings,
        loading,
        refreshSettings,
        updateSettings: (newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
