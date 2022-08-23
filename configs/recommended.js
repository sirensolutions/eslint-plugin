const typescriptRules = {
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',
  'semi': 'off',
  '@typescript-eslint/semi': 'error',
  '@typescript-eslint/type-annotation-spacing': 'error',
  '@typescript-eslint/member-delimiter-style': 'error',
  '@typescript-eslint/indent': ['error', 2],
  '@typescript-eslint/explicit-member-accessibility': 'error',
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
  plugins: [
    'mocha',
    'babel',
    'react',
    'react-hooks',
    'import',
    'prefer-object-spread',
    'siren'
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  env: {
    amd: true,
    mocha: true,
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    'block-scoped-var': 'error',
    camelcase: [ 'error', { properties: 'never' } ],
    'comma-dangle': 'off',
    'comma-style': [ 'error', 'last' ],
    'consistent-return': 'off',
    curly: [ 'error', 'multi-line' ],
    'dot-location': [ 'error', 'property' ],
    'dot-notation': [ 'error', { allowKeywords: true } ],
    eqeqeq: [ 'error', 'allow-null' ],
    'guard-for-in': 'error',
    indent: [ 'error', 2, { SwitchCase: 1 } ],
    'key-spacing': [ 'off', { align: 'value' } ],
    'max-len': [ 'error', 140, 2, { ignoreComments: true, ignoreUrls: true } ],
    'new-cap': [ 'error', { capIsNewExceptions: [ 'Private' ] } ],
    'no-bitwise': 'off',
    'no-caller': 'error',
    'no-cond-assign': 'off',
    'no-const-assign': 'error',
    'no-debugger': 'error',
    'no-empty': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-parens': 'off',
    'no-global-assign': 'error',
    'no-irregular-whitespace': 'error',
    'no-iterator': 'error',
    'no-loop-func': 'error',
    'no-multi-str': 'error',
    'no-nested-ternary': 'error',
    'no-new': 'off',
    'no-path-concat': 'off',
    'no-proto': 'error',
    'no-redeclare': 'error',
    'no-restricted-globals': [ 'error', 'context' ],
    'no-return-assign': 'off',
    'no-script-url': 'error',
    'no-sequences': 'error',
    'no-shadow': 'off',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    'no-underscore-dangle': 'off',
    'no-unused-expressions': 'off',
    'no-var': 'error',
    'no-with': 'error',
    'one-var': [ 'error', 'never' ],
    'prefer-const': 'error',
    'semi-spacing': [ 'error', { before: false, after: true } ],
    semi: [ 'error', 'always' ],
    'space-before-blocks': [ 'error', 'always' ],
    'space-before-function-paren': [ 'error', { anonymous: 'always', named: 'never' } ],
    'space-in-parens': [ 'error', 'never' ],
    'space-infix-ops': [ 'error', { int32Hint: false } ],
    'space-unary-ops': [ 'error' ],
    strict: [ 'error', 'never' ],
    'valid-typeof': 'error',
    'wrap-iife': [ 'error', 'outside' ],
    yoda: 'off',

    'object-curly-spacing': 'off', // overridden with babel/object-curly-spacing
    'babel/object-curly-spacing': [ 'error', 'always' ],

    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'error',

    'mocha/handle-done-callback': 'error',
    'mocha/no-exclusive-tests': 'error',

    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-duplicates': 'error',

    '@typescript-eslint/no-duplicate-imports': 'error',
    '@typescript-eslint/no-extra-semi': 'error',
    '@typescript-eslint/no-use-before-define': ['error', { 'functions': false, 'classes': false }],
    'no-duplicate-imports': 'off',
    'no-extra-semi': 'off',
    'no-use-before-define': 'off',
    'eol-last': 'error',
    'import/no-default-export': 'off',
    'import/no-unresolved': ['error', { ignore: ['^ui/.*', '^plugins/.*', 'ng_mock'] }],
    'import/order': ['warn', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      pathGroups: [
        { pattern: '@*/*', group: 'external' }, // Scoped packages are not recognized as external without this
      ],
      'newlines-between': 'always-and-inside-groups'
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0, maxBOF: 0 }],
    'no-unused-vars': 'error',
    'prefer-object-spread/prefer-object-spread': 'error',
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react/display-name': 'off',
    'react/no-multi-comp': 'off',
    'react/prop-types': 'off',
    'keyword-spacing': 'error',
    'siren/memory-leak': 'error',
    'siren/nolookbehind': 'error',
    'siren/same-core-dependency-version': 'error',
    'siren/promise-all': 'error'
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
