import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const AuthCallback = () => {
  const { isLoading } = useAuth();

  useEffect(() => {
    // AuthContext handles the token from URL
    // This component just shows loading state
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">로그인 처리 중...</div>
        </div>
      </div>
    );
  }

  return null;
};
