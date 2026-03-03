import axios from 'axios';

// Auto-detect backend URL:
// 1. Use explicit env var if set (NEXT_PUBLIC_API_URL)
// 2. In Codespaces: replace current port with 3000 in the URL
// 3. Fallback to localhost:3000 for local dev
function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('app.github.dev')) {
    // Replace port suffix in Codespaces URL (e.g. *-3001.app.github.dev → *-3000.app.github.dev)
    return window.location.origin.replace(/-\d+\.app\.github\.dev/, '-3000.app.github.dev');
  }
  return 'http://localhost:3000';
}

const API_URL = getApiUrl();
const TOKEN_KEY = 'auth_token';


const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired/invalid)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 테스트 모드일 때는 자동 로그아웃 하지 않음
      const isTestMode = localStorage.getItem('test_mode');
      if (isTestMode !== 'true') {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
