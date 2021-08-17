const { RuleTester } = require('eslint');
const rule = require('./nolookbehind');

const ruleTester = new RuleTester();

const expectedError = { message: 'Unexpected lookbehind in regular expressions' };

ruleTester.run('nolookbehind', rule, {
  valid: [
    'var re = /valid/;',
    'var re = RegExp("valid");',
  ],
  invalid: [
    { 
        code: 'var re = RegExp("(?<=a)invalid1");', 
        errors: [expectedError] 
    },
    { 
        code: 'var re = /(?<=a)invalid2/;', 
        errors: [expectedError] 
    },
  ]
});
