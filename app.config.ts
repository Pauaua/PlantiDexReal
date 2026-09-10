import type { ExpoConfig } from 'expo/config';

// Read at build/config time (EAS Build, `expo start`), not bundled into the
// JS app — so this does NOT need the EXPO_PUBLIC_ prefix. Set it in .env for
// local builds and as an EAS secret for cloud builds.
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? '';

const config: ExpoConfig = {
  name: 'plantidexreal',
  slug: 'plantidexreal',
  owner: 'plantidex',
  version: '1.0.0',
  scheme: 'plantidex',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.plantidex.app',
    infoPlist: {
      NSCameraUsageDescription: 'Plantidex usa la cámara para fotografiar especies que registras.',
      NSLocationWhenInUseUsageDescription:
        'Plantidex usa tu ubicación para geolocalizar las especies que reportas.',
    },
  },
  android: {
    package: 'com.plantidex.app',
    adaptiveIcon: {
      backgroundColor: '#0B1A12',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: ['CAMERA', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    config: {
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-status-bar',
    'expo-sqlite',
    [
      'expo-camera',
      {
        cameraPermission: 'Plantidex usa la cámara para fotografiar especies que registras.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Plantidex usa tu ubicación para geolocalizar las especies que reportas.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Plantidex necesita acceso a tus fotos para adjuntar imágenes de especies.',
      },
    ],
    [
      '@sentry/react-native',
      {
        url: 'https://sentry.io/',
      },
    ],
  ],
  extra: {
    router: {},
    // Filled in automatically the first time you run `eas init` (or
    // `eas build`) — see README.md "EAS Build" for the full setup flow.
    eas: {
      projectId: 'feeed220-2b63-4fb7-988b-ae4b7f6c05ab',
    },
  },
};

export default config;
