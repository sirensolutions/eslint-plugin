const createHash = require('./create_hash');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect blocking two lines of await where former is possibly blocking the later',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/sirensolutions/eslint-plugin/blob/master/rules/no-double-await/no-double-await.md'
    },
    schema: [] // no options
  },
  create: (context) => ({
    Identifier: IdentifierChecker(context)
  })
};

// Note:
// here we will store all processed block nodes
// we can NOT store the whole nodes as this would be memory heavy
// on Investigate source code it can add 1.5GB during eslint execution
// Unfortunately we can not simply mark the node with some temp variable as eslint does not allow any
// modification of the AST by rule implementation
// The only solution is to compute a hash of each node
// and use hashes to check if the node was already processed or not
const  processedBlockNodes = {};

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
      const blockNode = node.parent.parent.parent
      const blockNodeHash = createHash(blockNode);
      if (processedBlockNodes[blockNodeHash]) {
        return;
      }
      if (blockNode.body.length < 2) {
        return
      }

      for (let i = 1; i < blockNode.body.length; i++) {
        const line = blockNode.body[i];
        if (isLine(line)) {
          const previousLine = blockNode.body[i-1];
          if (isLine(previousLine)) {
            const previousVariableNames = getVariableNames(context, previousLine);
            const currentCallArgNames = getCallArgNames(context, line.declarations[0].init.argument);

            if (currentCallArgNames.length === 0 || !includeAtLeastOne(currentCallArgNames, previousVariableNames)) {
                context.report({ node, message: 'Previous line is blocking the execution of this line use await Promise.all' });
            }
          }
        }
      }
      processedBlockNodes[blockNodeHash] = true;
    }
  };
}

function includeAtLeastOne(a, b) {
  for (const nameA of a) {
    for (const nameB of b) {
      if (nameA === nameB) {
        return true;
      }
    }
  }
}

function isTestFile(context) {
  const testFileNameRegex = /\.test\.|__tests__|test\/functional/g;
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

function getVariableNames(context, node) {
  const vars = context.getDeclaredVariables(node)
  return vars.map(v => v.name);
}

function getCallArgNames(context, node) {
  const arr = [];
  _addCallArgNames(context, [node], arr);
  return arr;
}

function _addCallArgNames(context, nodes, arr) {
  nodes.map(node => {
    if (node.type === 'CallExpression') {
      _addCallArgNames(context, node.arguments, arr);
      if (node.callee && node.callee.type === 'MemberExpression' && node.callee.object) {
        _addCallArgNames(context, [node.callee.object], arr);
        if (node.callee.object.arguments) {
          _addCallArgNames(context, node.callee.object.arguments, arr);
        }
      }
    } else if (node.type === 'Identifier') {
      arr.push(node.name);
    } else if (node.type === 'MemberExpression') {
      if (node.object && node.object.name && node.property && node.property.type === 'Identifier') {
        _addCallArgNames(context, [node.object], arr);
      } else if (node.object && node.object.type === 'ThisExpression' && node.property && node.type === 'Identifier' ) {
        arr.push('this.' + node.property.name);
      }
    } else if (node.type === 'ObjectExpression') {
      _addCallArgNames(context, node.properties, arr);
    } else if (node.type === 'ArrowFunctionExpression') {
      if (node.body && node.body.type !== 'BlockStatement' && node.body.arguments) {
        _addCallArgNames(context, node.body.arguments, arr);
      } else if (node.body && node.body.type === 'BlockStatement') {
      // do nothing for now
      // TODO: handle case where it is a BlockStatement
      } else if (node.body && node.body.type === 'AwaitExpression' && node.body.argument && node.body.argument.arguments ) {
        _addCallArgNames(context, node.body.argument.arguments, arr);
      }
    } else if (node.type === 'ArrayExpression') {
      _addCallArgNames(context, node.elements, arr);
    } else if (node.type === 'Property') {
      if (node.value && node.value.name) {
        arr.push(node.value.name)
      } else {
        _addCallArgNames(context, [node.value], arr);
      }
    } else if (node.type === 'TemplateLiteral' && node.expressions) {
      _addCallArgNames(context, node.expressions, arr);
    } else if (node.type === 'Literal' || node.type === 'ThisExpression') {
      // do nothing as this would be things like true, false, 'string', 5
    } else {
      throw new Error ('Not implemented for type: ' + node.type)
    }
  });
}
