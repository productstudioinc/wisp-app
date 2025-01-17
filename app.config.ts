import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Wisp',
  slug: 'wisp-app',
  owner: 'productstudioinc',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'wisp',
  userInterfaceStyle: 'automatic',
  description: 'Wisp - Your AI App Generator',
  primaryColor: '#000000',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.productstudio.wisp',
    usesAppleSignIn: true,
    icon: {
      light: './assets/images/icon-light.png',
      dark: './assets/images/icon-dark.png',
      tinted: './assets/images/icon-tinted.png',
    },
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSCameraUsageDescription: 'We need access to your camera to add reference images.',
      NSPhotoLibraryUsageDescription:
        'We need access to your photo library to add reference images.',
      CFBundleAllowMixedLocalizations: true,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.productstudio.wisp',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    'expo-apple-authentication',
    'expo-localization',
    [
      'expo-build-properties',
      {
        android: {
          minSdkVersion: 26,
        },
      },
    ],
    'expo-font',
    'expo-secure-store',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '3d62779f-23ce-4e87-b81f-c2735e905cdb',
    },
  },
};

export default config;
