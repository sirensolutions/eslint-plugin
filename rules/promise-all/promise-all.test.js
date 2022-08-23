const { RuleTester } = require('eslint');
const rule = require('./promise-all');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 8 } });
const errors = [{ message: 'Previous line is blocking the execution of this line use await Promise.all' }];

ruleTester.run('promise-all', rule, {
  valid: [
    {
      name: 'not related',
      code: 'console.log("this is fine")'
    },
    {
      name: 'no await',
      code: `function getX() {};
      function getY() {};
      function main() {
        const x = getX();
        const y = getY(x);
      }`
    },
    {
      name: 'second line arg as variable',
      code: `async function getX() {};
      async function getY() {};
      async function main() {
        const x = await getX();
        const y = await getY(x);
      }`
    },
    {
      name: 'second line arg wrapped in function',
      code: `async function getX() {};
      async function getY() {};
      function processX() {};
      async function main() {
        const x = await getX();
        const y = await getY(processX(x));
      }`
    }
  ],
  invalid: [
    {
      name: 'second line arg as variable',
      code : `async function getX() {};
      async function getY() {};
      async function main() {
        const x = await getX();
        const y = await getY();
      }`,
      errors
    },
    {
      name: 'second line arg wrapped in function',
      code: `async function getX() {};
      async function getY() {};
      function processX() {};
      async function main() {
        const x = await getX();
        const y = await getY(processX());
      }`,
      errors
    }
  ]
});
