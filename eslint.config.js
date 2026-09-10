const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'writable',
        __dirname: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      'android/*',
      'ios/*',
      'db/migrations/migrations.js',
      'db/migrations/meta/*',
    ],
  },
];
