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
      async function main(searchId) {
        const savedSearch = await savedSearches.get(searchId);
        const { coatNode, treeNode } = await getEntityNodes(savedSearch, EntityType.SAVED_SEARCH, true, iconService);
      }`
    },
    {
      name: 'this expression',
      code: `
      async function main() {
        const savedRelation = await this._createRelationObject(relation);
        const id = await savedRelation.save({ checkIfDuplicateExists: false, savedRelation });
      }`
    },
    {
      name: 'arrow function expression',
      code: `
      const o = [];
      function processX () {};
      async function main() {
        const x = await getX();
        const results = await o.map(d => processX(x));
      }`
    },
    {
      name: 'arrow function expression wrapped in Promise.all',
      code: `
      const o = [];
      function processX () {};
      async function main() {
        const x = await getX();
        const results = await Promise.all(o.map(d => processX(x)));
      }`
    },
    {
      name: '.map after promise',
      code: `
      const model = {};
      const esOptions = {};
      function normalizeEsDoc() {};
      function wrapSearch() {};
      function get() {};

      async function main() {
        const { response, zzz } = await model.search(esOptions.size, esOptions, req, ignoreBroken, namespaceFilter);
        const savedObjects = await Promise.all(get(response, 'hits.hits', [zzz])
          .map(async (hit) => {
            const doc = normalizeEsDoc(hit);
            if (type === 'search') {
              await wrapSearch.call(this, doc, req);
            }
            return doc;
          }));
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
    },
    {
      name: 'this expression',
      code: `
      async function main() {
        const savedRelation = await this._createRelationObject(relation);
        const id = await savedRelation.save({ checkIfDuplicateExists: false });
      }`,
      errors
    },
    {
      name: 'arrow function expression',
      code: `
      const o = [];
      function process () {};
      async function main() {
        const x = await getX();
        const results = await o.map(d => process());
      }`,
      errors
    },
    {
      name: 'arrow function expression - wrapped in Promise.all',
      code: `
      const o = [];
      function process () {};
      async function main() {
        const x = await getX();
        const results = await Promise.all(o.map(d => process()));
      }`,
      errors
    },
    {
      name: '.map after promise',
      code: `
      const response = '';
      const model = {};
      const esOptions = {};
      function normalizeEsDoc() {};
      function wrapSearch() {};
      function get() {};

      async function main() {
        const { zzz } = await model.search(esOptions.size, esOptions, req, ignoreBroken, namespaceFilter);
        const savedObjects = await Promise.all(get(response, 'hits.hits', [])
          .map(async (hit) => {
            const doc = normalizeEsDoc(hit);
            if (type === 'search') {
              await wrapSearch.call(this, doc, req);
            }
            return doc;
          }));
      }`,
      errors
    }




  ]
});
