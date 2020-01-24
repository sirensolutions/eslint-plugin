module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow x.on() on without corresponding x.off()',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/sirensolutions/eslint-plugin-siren/blob/master/rules/memory-leak/memory-leak.md'
    },
    schema: [] // no options
  },
  create: (context) => ({
    Identifier: IdentifierChecker(context)
  })
};

function IdentifierChecker(context) {
  return node => {
    if (isTestFile(context) || !isEventSubscription(node)) {
      return;
    }

    const objectName = getObjectNameForNode(node);

    const skipNames = [
      'elasticdump', 'server',
      'request', 'req',
      'response', 'resp', 'res',
      'worker', 'sender', 'process', 'lifecycle', 'cluster',
      'stream', 'readStream', 'writeStream', 'readable', 'scrollStream', 'csvStream',
      'spawn', 'stderr', 'stdout',
      'segmented', 'watcher', 'zipfile', 'rl', 'esStatus'
    ];

    if (!objectName || skipNames.includes(objectName)) {
      return;
    }

    let eventName = node.parent.parent.arguments[0].value;
    let lastPartOfEventName;
    if ((typeof eventName === 'string' || eventName instanceof String) && eventName.includes('.')) {
      // Event with namespace, cut everything before the last '.'
      lastPartOfEventName = eventName.substring(eventName.lastIndexOf('.'));
    }

    const deregisterPatterns = [
      `.off('${lastPartOfEventName || eventName}'`,
      `.off("${lastPartOfEventName || eventName}"`,
      '.off()',
      '.removeAllListeners()',
      '.destroy()',
      `.removeListener('${eventName}'`,
      `.removeListener("${eventName}"`,
      `.removeEventListener('${eventName}'`,
      `.removeEventListener("${eventName}"`
    ];

    const sourceCode = context.getSourceCode();

    function isFoundInSourceFile(pattern) {
      const escapedPattern = (objectName + pattern)
        .replace(/\$/g, '\\$')
        .replace(/\./g, '\\.')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');

      return RegExp(escapedPattern, 'g').test(sourceCode.text);
    }

    if (!deregisterPatterns.some(isFoundInSourceFile)) {
      context.report({ node, message: 'Event listener is never removed' });
    }
  };
}

function isTestFile(context) {
  const testFileNameRegex = /__tests__|test\/functional|tasks|functional_test_runner|junit_report_generation|core_plugins\/console\/public|gulpfile\.js/g;
  return testFileNameRegex.test(context.getFilename());
}

function getObjectNameForNode(node) {
  if (isMemberExpressionWithIdentifier(node.parent.object) || hasNestedMember(node.parent) || isThisIdentifier(node.parent.object)) {
    return node.parent.object.property.name;
  } else if (isDotOn(node.parent)) {
    return 'this';
  } else if (isCallExpression(node.parent.object) && calleeIsIdentifier(node.parent)) {
    const argsList = getArgumentsString(node.parent.object.arguments);
    return `${node.parent.object.callee.name}(${argsList})`;
  } else if (isCallExpression(node.parent.object) && isMemberExpressionWithObjectIdentifier(node.parent.object.callee)) {
    const argsList = getArgumentsString(node.parent.object.arguments);
    return `${node.parent.object.callee.object.name}.${node.parent.object.callee.property.name}(${argsList})`;
  } else if (notSure2(node.parent)) {
    return node.parent.object.name;
  }
}

function getArgumentsString(args) {
  return args.map(stringifyNode).join(', ');
}

function stringifyNode(node) {
  if (node.type === 'MemberExpression' && isThisIdentifier(node)) {
    return `this.${node.property.name}`;
  } else if (isMemberExpressionWithObjectIdentifier(node)) {
    return `${node.object.name}.${node.property.name}`;
  } else if (node.type === 'Literal') {
    return `'${node.value}'`;
  } else if (node.type === 'Identifier') {
    return node.name;
  } else {
    return undefined;
  }
}


///////////////////////////// NODE CONDITIONALS /////////////////////////////

// someObject.on('eventName', ...)
function isEventSubscription(node) {
  return node.name === 'on' &&
    node.type === 'Identifier' &&
    node.parent.type === 'MemberExpression' &&
    node.parent.parent.type === 'CallExpression' &&
    node.parent.parent.arguments.length === 2 &&
    node.parent.parent.arguments[0].type === 'Literal' &&
    node.parent.parent.arguments[0].value !== '$destroy';
}

// someObject.attribute
function isMemberExpressionWithIdentifier(node) {
  return node.type === 'MemberExpression' &&
    node.property &&
    node.property.type === 'Identifier';
}

// this.on(...)
function isDotOn(node) {
  return isMemberExpressionWithIdentifier(node.object) &&
    node.property.name === 'on';
}

// func(value) or someObject.func(value)
function isCallExpression(node) {
  return node.type === 'CallExpression' &&
    node.callee &&
    node.arguments;
}

// func(value)
function calleeIsIdentifier(node) {
  return node.object.callee.type === 'Identifier';
}

// someObject.func(value)
function isMemberExpressionWithObjectIdentifier(node) {
  return isMemberExpressionWithIdentifier(node) &&
    node.object &&
    node.object.type === 'Identifier';
}

// someObject.member.nestedMember
function hasNestedMember(node) {
  return node.object.object &&
    node.object.object.type === 'Identifier' &&
    node.object.property &&
    node.object.property.type === 'Identifier';
}

// Not sure...
function isThisIdentifier(node) {
  return node.object &&
    node.object.type === 'ThisExpression' &&
    node.property &&
    node.property.type === 'Identifier';
}

// Not sure...
function notSure2(node) {
  return node.object.name &&
    node.object.type === 'Identifier';
}
