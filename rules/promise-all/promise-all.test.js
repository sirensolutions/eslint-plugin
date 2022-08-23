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
    },
    {
      name: 'object with methods method + many arguments',
      code: `
      const EntityType = {
        SAVED_SEARCH: 'savedSearch'
      };
      const iconService = {};
      async function getEntityNodes() {}
      const savedSearches = { get: async () => {}, getY: async () => {} };
      const $scope = {}
      $scope.addMainSearchNode = async function (searchId) {
        const savedSearch = await savedSearches.get(searchId);
        const { coatNode, treeNode } = await getEntityNodes(savedSearch, EntityType.SAVED_SEARCH, true, iconService);
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
    },
    {
      name: 'object with methods method + many arguments',
      code: `
      const EntityType = {
        SAVED_SEARCH: 'savedSearch'
      };
      const iconService = {};
      async function getEntityNodes() {}
      const savedSearches = { get: async () => {}, getY: async () => {} };
      const $scope = {}
      $scope.addMainSearchNode = async function (searchId) {
        const savedSearch = await savedSearches.get(searchId);
        const { coatNode, treeNode } = await getEntityNodes(EntityType.SAVED_SEARCH, true, iconService);
      }`,
      errors
    }

  ]
});
