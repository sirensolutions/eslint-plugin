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
            const previousVariableNames = getVariableNames(previousLine);
            const currentCallArgNames = getCallArgNames(line.declarations[0].init.argument);

            if (currentCallArgNames.length === 0 || !includeAtLeastOne(currentCallArgNames, previousVariableNames)) {
                context.report({ node, message: 'Previous line is blocking the execution of this line use await Promise.all' });
            }
          }
        }
      }
      processedBlockNodes.push(blockNode)
    }
  };
}

function includeAtLeastOne(a, b) {
  for (const namea of a) {
    for (const nameb of b) {
      if (namea === nameb) {
        return true;
      }
    }
  }
}

function isTestFile(context) {
  const testFileNameRegex = /\.test\.|__tests__|test\/functional|tasks|functional_test_runner|junit_report_generation|core_plugins\/console\/public|gulpfile\.js/g;
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


// TODO: use context.getDeclaredVariables(
  // node.getVariableNames method to make sure we are getting good names

function getVariableNames(node) {
  const n = node.declarations[0].id;
  if (n.type === 'Identifier') {
    return [node.declarations[0].id.name];
  } else if (n.type === 'ObjectPattern') {
    return n.properties.map(p => p.key.name);
  }
  return [];
}

function getCallArgNames(node) {
  const arr = [];
  _addCallArgNames([node], arr);
  return arr;
}

function _addCallArgNames(nodes, arr) {
  nodes.map(arg => {
    if (arg.type === 'CallExpression') {
      _addCallArgNames(arg.arguments, arr);
      if (arg.callee && arg.callee.type === 'MemberExpression' && arg.callee.object) {
        _addCallArgNames([arg.callee.object], arr);
        if (arg.callee.object.arguments) {
          _addCallArgNames(arg.callee.object.arguments, arr);
        }
      }
    } else if (arg.type === 'Identifier') {
      arr.push(arg.name);
    } else if (arg.type === 'MemberExpression') {
      if (arg.object && arg.object.name && arg.property && arg.property.type === 'Identifier') {
        _addCallArgNames([arg.object], arr);
      } else if (arg.object && arg.object.type === 'ThisExpression' && arg.property && arg.type === 'Identifier' ) {
        arr.push('this.' + arg.property.name);
      }
    } else if (arg.type === 'ObjectExpression') {
      _addCallArgNames(arg.properties, arr);
    } else if (arg.type === 'ArrowFunctionExpression') {
      if (arg.body && arg.body.type !== 'BlockStatement' && arg.body.arguments) {
        _addCallArgNames(arg.body.arguments, arr);
      } else if (arg.body && arg.body.type === 'BlockStatement') {
      // do nothing for now
      // TODO: handle case where it is a BlockStatement
      } else if (arg.body && arg.body.type === 'AwaitExpression' && arg.body.argument && arg.body.argument.arguments ) {
        _addCallArgNames(arg.body.argument.arguments, arr);
      }
    } else if (arg.type === 'ArrayExpression') {
      _addCallArgNames(arg.elements, arr);
    } else if (arg.type === 'Property') {
      if (arg.value && arg.value.name) {
        arr.push(arg.value.name)
      }
    } else if (arg.type === 'Literal' || arg.type === 'ThisExpression') {
      // do nothing as this would be things like true, false, 'string', 5
    } else {
      throw new Error ('Not implemented for type: ' + arg.type)
    }
  });
}
