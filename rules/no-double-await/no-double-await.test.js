const { RuleTester } = require('eslint');
const rule = require('./no-double-await');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 8 } });
const errors = [{ message: 'Previous line is blocking the execution of this line use await Promise.all' }];

ruleTester.run('no-double-await', rule, {
  valid: [
    {
      name: 'not related',
      code: 'console.log("this is fine")'
    },
    {
      name: 'no await',
      code: `
      function main() {
        const x = getX();
        const y = getY(x);
      }`
    },
    {
      name: 'second line arg as variable',
      code: `
      async function main() {
        const x = await getX();
        const y = await getY(x);
      }`
    },
    {
      name: 'second line arg wrapped in function',
      code: `
      async function main() {
        const x = await getX();
        const y = await getY(processX(x));
      }`
    },
    {
      name: 'object with methods method + many arguments',
      code: `
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
      async function main() {
        const x = await getX();
        const results = await o.map(d => processX(x));
      }`
    },
    {
      name: 'arrow function expression wrapped in Promise.all',
      code: `
      async function main() {
        const x = await getX();
        const results = await Promise.all(o.map(d => processX(x)));
      }`
    },
    {
      name: '.map after promise',
      code: `
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
    },
    {
      name: 'this',
      code: `
      async function main() {
        const types = await aclTypes.find();
        const response = await this._client.list(types);
      }`
    },
    {
      name: 'arrow function expression',
      code: `
      async function main() {
        const kibiNodes = await Promise.all(map(selectedNodes, async node => await dataModelHelper.graphNodeToKibiNode(node.getModel())));
        const kibiCombos = await Promise.all(
          map(selectedCombos, async combo => await dataModelHelper.graphComboToKibiNode(combo.getModel(kibiNodes)))
        );
      }`
    },
    {
      name: 'use method from first variable',
      code: `
      async function main() {
        const x = await getX();
        const y = await x.getY();
      }`
    },
    {
      name: 'use method from variable in arguments',
      code: `
      async function main() {
        const replicatedObjects = await this._replicateSavedObjects();
        const esResponse = await this.bulkCreate(replicatedObjects.bulkBody);      }`
    },
    {
      name: 'rename spread variable to camelCase',
      code: `
      async function main() {
        const { saved_objects: savedObjects } = await getX();
        const results = await Promise.all(savedObjects.map(d => collectPanels(savedObjectsClient, d)));
      }`
    },
    {
      name: 'detect that the variable is used in string template',
      code: `
      async function main() {
        const response = await getX();
        const user = await this._server.plugins.investigate_access_control.authenticate({
          ` +
          "value: `Bearer ${response.access_token}`" +
          `
        });
      }`
    },
    {
      name: 'ternary operators',
      code: `
      async function main() {
        const x = this.state.includeSnapshot ? await getX() : undefined;
        const y = this.state.includeData ? await getY(x) : undefined;
      }`
    },
  ],
  invalid: [
    {
      name: 'binary operation',
      code: `
      async function main() {
        const x = await getX();
        const y = await getY(1+2);
      }`,
      errors
    },
    {
      name: 'second line arg as variable',
      code : `
      async function main() {
        const x = await getX();
        const y = await getY();
      }`,
      errors
    },
    {
      name: 'second line arg wrapped in function',
      code: `
      async function main() {
        const x = await getX();
        const y = await getY(processX());
      }`,
      errors
    },
    {
      name: 'object with methods method + many arguments',
      code: `
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
        const x = await this._createRelationObject(relation);
        const id = await y.save({ checkIfDuplicateExists: false });
      }`,
      errors
    },
    {
      name: 'arrow function expression',
      code: `
      async function main() {
        const x = await getX();
        const results = await o.map(d => process());
      }`,
      errors
    },
    {
      name: 'arrow function expression - wrapped in Promise.all',
      code: `
      async function main() {
        const x = await getX();
        const results = await Promise.all(o.map(d => process()));
      }`,
      errors
    },
    {
      name: '.map after promise',
      code: `
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
    },
    {
      name: 'this',
      code: `
      async function main() {
        const types = await aclTypes.find();
        const response = await this._client.list(this._id);
      }`,
      errors
    },
    {
      name: 'arrow function expression',
      code: `
      async function main() {
        const kibiNodes = await Promise.all(map(selectedNodes, async node => await dataModelHelper.graphNodeToKibiNode(node.getModel())));
        const kibiCombos = await Promise.all(
          map(selectedCombos, async combo => await dataModelHelper.graphComboToKibiNode(combo.getModel()))
        );
      }`,
      errors
    },
    {
      name: 'detect that the variable is used in string template',
      code: `
      async function main() {
        const x = await getX();
        const user = await this._server.plugins.investigate_access_control.authenticate({
          ` +
          "value: `Bearer ${response.access_token}`" +
          `
        });
      }`,
      errors
    },
    {
      name: 'ternary operators',
      code: `
      async function main() {
        const x = this.state.includeSnapshot ? await getX() : undefined;
        const y = this.state.includeData ? await getY() : undefined;
      }`,
      errors
    },
  ]
});
