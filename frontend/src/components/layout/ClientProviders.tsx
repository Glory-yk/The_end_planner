'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ThemeProvider>
    );
}
