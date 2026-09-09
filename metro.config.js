const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle SQL migration files are bundled as text assets for expo-sqlite.
config.resolver.sourceExts.push('sql');

module.exports = withNativeWind(config, { input: './global.css' });
