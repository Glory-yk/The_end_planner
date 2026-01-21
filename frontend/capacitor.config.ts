import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mandalaplan.app',
  appName: 'MandalaPlan',
  webDir: 'dist',
  server: {
    // 앱 내 WebView에서 로컬 파일 사용 (브라우저로 열리지 않음)
    androidScheme: 'https',
    // API 서버 URL (CORS 우회)
    allowNavigation: ['theendplanner-production.up.railway.app']
  },
  android: {
    // 외부 링크도 앱 내에서 열기
    allowMixedContent: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
