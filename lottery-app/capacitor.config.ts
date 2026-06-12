import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.laolots.app',
  appName: 'Lao Lottery Live',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
