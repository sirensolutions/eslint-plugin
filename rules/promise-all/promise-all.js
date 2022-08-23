module.exports = {
    meta: {
      type: 'problem',
      docs: {
        description: 'Detect blocking two lines of await where former is possibly blocking the later',
        category: 'Best Practices',
        recommended: true,
        url: 'https://github.com/sirensolutions/eslint-plugin/blob/master/rules/promise-all/promise-all.md'
      },
      schema: [] // no options
    },
    create: (context) => ({
      Identifier: IdentifierChecker(context)
    })
  };

const  processedBlockNodes = [];

function IdentifierChecker(context) {
  return node => {
    if (isTestFile(context)) {
      return;
    }

    if (
      node.type === 'Identifier' &&
      node.parent && node.parent.type === 'VariableDeclarator' &&
      node.parent.init && node.parent.init.type === 'AwaitExpression' &&
      node.parent.init.argument && node.parent.init.argument.type === 'CallExpression' &&
      node.parent.parent && node.parent.parent.type === 'VariableDeclaration' &&
      node.parent.parent.parent && node.parent.parent.parent.type === 'BlockStatement'
    ) {
    // get the parent BlockStatement to see if there are at least two
      const blockNode = node.parent.parent.parent
      if (processedBlockNodes.includes(blockNode)) {
        return;
      }
      for (let i = 1; i < blockNode.body.length; i++) {
        const line = blockNode.body[i];
        if (isLine(line)) {
          const previousLine = blockNode.body[i-1];
          if (isLine(previousLine)) {
            const previousVariableName = getVariableName(previousLine);
            const currentCallArgNames = getCallArgNames(line.declarations[0].init.argument);

            if (currentCallArgNames.length === 0 || !currentCallArgNames.includes(previousVariableName)) {
                context.report({ node, message: 'Previous line is blocking the execution of this line use await Promise.all' });
            }
          }
        }
      }
      processedBlockNodes.push(blockNode)
    }
  };
}

function isTestFile(context) {
const testFileNameRegex = /__tests__|test\/functional|tasks|functional_test_runner|junit_report_generation|core_plugins\/console\/public|gulpfile\.js/g;
return testFileNameRegex.test(context.getFilename());
}

///////////////////////////// NODE CONDITIONALS /////////////////////////////

function isLine(node) {
if (
    node.type === 'VariableDeclaration' &&
    node.declarations && node.declarations.length === 1 && node.declarations[0].type === 'VariableDeclarator' &&
    node.declarations[0].init && node.declarations[0].init.type === 'AwaitExpression' &&
    node.declarations[0].init.argument && node.declarations[0].init.argument.type === 'CallExpression'
) {
    return true;
}
}

function getVariableName(node) {
  return node.declarations[0].id.name;
}

function getCallArgNames(node) {
  const arr = [];
  _addCallArgNames(node, arr);
  return arr;
}

function _addCallArgNames(node, arr) {
  node.arguments.map(arg => {
    if (arg.type === 'CallExpression') {
      return _addCallArgNames(arg, arr);
    } else if (arg.type === 'Identifier') {
      return arr.push(arg.name);
    } else if (arg.type === 'MemberExpression' && arg.object && arg.object.name && arg.property && arg.property.type === 'Identifier') {
      arr.push(arg.object.name + '.' + arg.property.name)
    } else if (arg.type === 'ObjectExpression') {
      _addCallArgNames({ arguments: arg.properties }, arr);
    } else if (arg.type === 'Property') {
      if (arg.value && arg.value.name) {
        arr.push(arg.value.name)
      }
    } else if (arg.type === 'Literal') {
      // do nothing as this would be things like true, false, 'string', 5
    } else {
      throw new Error ('Not implemented for type: ' + arg.type)
    }
  });
}
