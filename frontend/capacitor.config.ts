import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kokakan.juku',
  appName: '塾管理システム',
  webDir: 'dist',
  server: {
    // 開発時: バックエンドのURLに合わせて変更
    // 本番時: この設定を削除してビルドしたdistを使用
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1f2937',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1f2937',
    },
  },
};

export default config;
