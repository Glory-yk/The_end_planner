import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { getSafeLocalStorageItem, setSafeLocalStorageItem, removeSafeLocalStorageItem } from '@/utils/storage';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  testLogin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';
const TEST_MODE_KEY = 'test_mode';
const TEST_USER_KEY = 'test_user_data';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for token on mount
  useEffect(() => {
    // 테스트 모드: 백엔드 호출 없이 로컬 데이터로 복원
    const isTestMode = getSafeLocalStorageItem(TEST_MODE_KEY);
    if (isTestMode === 'true') {
      const savedUser = getSafeLocalStorageItem(TEST_USER_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken('dummy_test_token');
        } catch {
          removeSafeLocalStorageItem(TEST_MODE_KEY);
          removeSafeLocalStorageItem(TEST_USER_KEY);
        }
      }
      setIsLoading(false);
      return;
    }

    const storedToken = getSafeLocalStorageItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Handle OAuth callback

  useEffect(() => {
    // Check URL params (Web)
    const checkToken = (urlString: string) => {
      const urlObj = new URL(urlString);
      const token = urlObj.searchParams.get('token');
      if (token) {
        setSafeLocalStorageItem(TOKEN_KEY, token);
        setToken(token);
        fetchUser(token);
        // Clean URL (only for web browser address bar)
        if (!urlString.startsWith('http') || window.location.href === urlString) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    checkToken(window.location.href);

    // Deep Link Handling (App)
    App.addListener('appUrlOpen', async (event) => {
      console.log('Deep link received:', event.url);

      // mandalaplan://auth/callback?token=xxx 형식 처리
      if (event.url.startsWith('mandalaplan://')) {
        const url = new URL(event.url.replace('mandalaplan://', 'https://'));
        const token = url.searchParams.get('token');
        if (token) {
          setSafeLocalStorageItem(TOKEN_KEY, token);
          setToken(token);
          fetchUser(token);
          // 로그인 완료 후 InAppBrowser 닫기
          await Browser.close();
        }
      } else {
        checkToken(event.url);
        if (event.url.includes('token=')) {
          await Browser.close();
        }
      }
    });
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalid
        removeSafeLocalStorageItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      removeSafeLocalStorageItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    if (Capacitor.isNativePlatform()) {
      // 네이티브 앱: 커스텀 URL scheme으로 콜백 받기
      const redirectUri = 'mandalaplan://auth/callback';
      const authUrl = `${API_URL}/auth/google?state=${encodeURIComponent(redirectUri)}`;

      await Browser.open({
        url: authUrl,
        windowName: '_blank',
        presentationStyle: 'popover'
      });
    } else {
      // 웹 브라우저: 기존 방식
      window.location.href = `${API_URL}/auth/google`;
    }
  };

  const testLogin = () => {
    const fakeToken = "dummy_test_token";
    const fakeUser = {
      id: "test-user-id",
      email: "test@example.com",
      name: "테스트 유저"
    };
    // 테스트 모드 플래그와 유저 데이터를 저장해 새로고침 시에도 유지
    setSafeLocalStorageItem(TOKEN_KEY, fakeToken);
    setSafeLocalStorageItem(TEST_MODE_KEY, 'true');
    setSafeLocalStorageItem(TEST_USER_KEY, JSON.stringify(fakeUser));
    setToken(fakeToken);
    setUser(fakeUser);
  };

  const logout = () => {
    removeSafeLocalStorageItem(TOKEN_KEY);
    removeSafeLocalStorageItem(TEST_MODE_KEY);
    removeSafeLocalStorageItem(TEST_USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        testLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
