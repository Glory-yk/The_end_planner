'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // AuthContext's checkToken runs globally and sets the token
        // If authenticated, redirect to home page
        if (isAuthenticated) {
            router.replace('/');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-white text-xl">로그인 처리 중입니다...</div>
        </div>
    );
}
