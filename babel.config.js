module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@features': './features',
            '@lib': './lib',
            '@db': './db',
            '@store': './store',
            '@components': './components',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
