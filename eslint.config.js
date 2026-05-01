const eslintPlugin = require('eslint-plugin-eslint-plugin');
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['.yarn/**'],
  },
  js.configs.recommended,
  {
    plugins: {
      'eslint-plugin': eslintPlugin,
    },
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es6,
      },
    },
  },
];
