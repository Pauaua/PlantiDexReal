module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|nativewind|react-native-css-interop|react-native-maps|react-native-map-clustering|react-native-mmkv|react-native-worklets))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@features/(.*)$': '<rootDir>/features/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@db/(.*)$': '<rootDir>/db/$1',
    '^@store/(.*)$': '<rootDir>/store/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
  },
  collectCoverageFrom: ['features/**/*.{ts,tsx}', 'db/**/*.ts', '!**/*.d.ts'],
};
