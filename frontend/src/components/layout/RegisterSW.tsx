'use client';

import { useEffect } from 'react';

export function RegisterSW() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    console.log('[PWA] Service Worker registered:', reg.scope);
                    // Check for updates every 60 seconds
                    setInterval(() => reg.update(), 60_000);
                })
                .catch((err) => console.warn('[PWA] SW registration failed:', err));
        }
    }, []);

    return null;
}
