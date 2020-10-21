const typescriptRules = {
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars-experimental': ['error', { ignoreArgsIfArgsAfterAreUsed: true }],
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-use-before-define': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',
  'semi': 'off',
  '@typescript-eslint/semi': 'error',
  '@typescript-eslint/type-annotation-spacing': 'error',
  '@typescript-eslint/member-delimiter-style': 'error',
  '@typescript-eslint/indent': ['error', 2],
  '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
  '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true, allowTypedFunctionExpressions: true }],
  '@typescript-eslint/explicit-module-boundary-types': ['error', { allowArgumentsExplicitlyTypedAsAny: true }],
  '@typescript-eslint/ban-types': ['error', { 'types': { '{}': false } }],
  '@typescript-eslint/no-inferrable-types': ['error', { 'ignoreParameters': false, 'ignoreProperties': true }]
};

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: ['react', 'react-hooks', 'import', 'prefer-object-spread', 'siren'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    'no-unused-vars': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'eol-last': 'error',
    'no-multi-spaces': 'error',
    'import/no-unresolved': ['error', { ignore: ['^ui/.*', '^plugins/.*'] }],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0, maxBOF: 0 }],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'react/no-multi-comp': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'prefer-object-spread/prefer-object-spread': 'error',
    'siren/memory-leak': 'warn',
    'siren/same-core-dependency-version': 'error'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: typescriptRules
    },
    {
      files: ['*.test.[jt]s', '*.test.[jt]sx'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
      env: {
        'jest/globals': true
      }
    },
    {
      files: ['{tests,__tests__}/**/*.[jt]s', '{tests,__tests__}/**/*.[jt]sx'],
      plugins: ['mocha'],
      extends: ['plugin:mocha/recommended']
    },
    {
      files: [
        '*.{test,spec}.ts',
        '*.{test,spec}.tsx',
        '{tests,__tests__}/**/*.ts',
        '{tests,__tests__}/**/*.tsx'
      ],
      rules: typescriptRules
    }
  ],
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
};
