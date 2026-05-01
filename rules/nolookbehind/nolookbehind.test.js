const { RuleTester } = require('eslint');
const rule = require('./nolookbehind');
const tsParser = require('@typescript-eslint/parser');
const ruleTester = new RuleTester();

const expectedError = { message: 'Unexpected lookbehind in regular expressions' };

ruleTester.run('nolookbehind', rule, {
  valid: [
    'var re = /valid/;',
    'var re = RegExp("valid");',
  ],
  invalid: [
    {
        code: 'var re = RegExp("(?<=a)invalid1")',
        errors: [expectedError]
    },
    {
        code: 'var re = /(?<=a)b/',
        // using typescript parser as the default "espree" parser used by the test runner will fail to parse the regex
        languageOptions: { parser: tsParser },
        errors: [expectedError]
    },
  ]
});
