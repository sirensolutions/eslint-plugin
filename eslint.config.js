const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const eslintPluginPlugin = require('eslint-plugin-eslint-plugin');

module.exports = [
  {
    ignores: ['node_modules/**', '.yarn/**']
  },
  {
    files: ['**/*.js'],
    plugins: {
      'eslint-plugin': eslintPluginPlugin
    },
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'commonjs'
    },
    rules: {
      ...eslintPluginPlugin.configs.recommended.rules
    }
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
      }
    },
    rules: {
      ...tsPlugin.configs.recommended.rules
    }
  }
];