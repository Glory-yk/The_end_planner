'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { AppStoreProvider } from '@/hooks/useAppStore';
import { AppContent } from '@/components/layout/AppContent';

export const AuthenticatedApp = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-white text-xl">로딩 중...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <AppStoreProvider>
            <AppContent />
        </AppStoreProvider>
    );
};
