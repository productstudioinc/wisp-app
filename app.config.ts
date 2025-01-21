import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Wisp',
  slug: 'wisp-app',
  owner: 'productstudioinc',
  version: '1.0.1',
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
  updates: {
    url: 'https://u.expo.dev/3d62779f-23ce-4e87-b81f-c2735e905cdb',
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
    'expo-secure-store',
    [
      '@sentry/react-native/expo',
      {
        organization: 'wisp-ck',
        project: 'wisp',
        // If you are using a self-hosted instance, update the value of the url property
        // to point towards your self-hosted instance. For example, https://self-hosted.example.com/.
        url: 'https://sentry.io/',
      },
    ],
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
  runtimeVersion: {
    policy: 'appVersion',
  },
};

export default config;
