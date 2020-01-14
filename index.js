//------------------------------------------------------------------------------
// Checks for possible memory leaks
// if
//
// x.on('eventName')
//
// is found in the source file this rule checks if there is one of the corresponding
//
// x.off('eventName')
// x.off()
// x.destroy()
// x.removeListener()
//
// and reports a possible memory leak if non of the above is found
// Keep in mind that this is a very naive/hacky implementation which should be good enough to catch a common mistakes
//
//Run with
// node scripts/eslint.js --rulesdir scripts/eslintrules --no-cache
//
// to skip the rule use the following comment in your code
// // eslint-disable-line memoryleaks
//------------------------------------------------------------------------------

function gerArgumentsString(args) {
  const argArray = args.map(function (a) {
    if (
      a.type === 'MemberExpression' &&
      a.object && a.object.type === 'ThisExpression' &&
      a.property && a.property.type === 'Identifier'
    ) {

      return 'this.' + a.property.name;

    } else if (
      a.type === 'MemberExpression' &&
      a.object && a.object.type === 'Identifier' &&
      a.property && a.property.type === 'Identifier'
    ) {

      return a.object.name + '.' + a.property.name;

    } else if (a.type === 'Literal') {

      return '\'' + a.value + '\'';

    } else if (a.type === 'Identifier') {

      return a.name;

    } else {

      return undefined;

    }
  });

  const argsList = argArray.join(', ');
  return argsList;
}

const debug = false;

module.exports = {
  rules: {
    memoryleaks: {
      meta: {
        docs: {
          description: 'disallow el.on() on without corresponding el.off()',
          category: 'Possible memory leaks',
          recommended: true,
          url: ''
        },
        fixable: 'code',
        schema: [] // no options
      },
      create: function (context) {
        return {
          Identifier(node) {
            const filename = context.getFilename();
            const testsRegex =
              /__tests__|test\/functional|tasks|functional_test_runner|junit_report_generation|core_plugins\/console\/public|gulpfile\.js/g;
            if (testsRegex.test(filename)) {
              return;
            }

            if (node.name === 'on' && node.type === 'Identifier') {

              if (node.parent.type === 'MemberExpression') {

                if (node.parent.parent.type === 'CallExpression') {

                  if (node.parent.parent.arguments.length === 2 && node.parent.parent.arguments[0].type === 'Literal') {
                    const methodName = node.name;
                    const eventName = node.parent.parent.arguments[0].value;
                    if (eventName === '$destroy') {
                      // skip on('$destroy', ... os these ones are coming from angular or element
                      return;
                    }

                    if (debug) {
                      console.log(node.parent.object);
                    }

                    let objectName;
                    if (
                      node.parent.object.type === 'MemberExpression' &&
                      node.parent.object.property && node.parent.object.property.type === 'Identifier'
                    ) {
                      objectName = node.parent.object.property.name;

                    } else if (
                      node.parent.object.type === 'ThisExpression' &&
                      node.parent.property && node.parent.property.type === 'Identifier' &&
                      node.parent.property.name === 'on'
                    ) {

                      objectName = 'this';
                    } else if (
                      node.parent.object.type === 'CallExpression' &&
                      node.parent.object.callee &&
                      node.parent.object.callee.type === 'Identifier' &&
                      node.parent.object.arguments
                    ) {

                      const argsList = gerArgumentsString(node.parent.object.arguments);
                      objectName = node.parent.object.callee.name + '(' + argsList + ')';

                    } else if (
                      node.parent.object.type === 'CallExpression' &&
                      node.parent.object.callee &&
                      node.parent.object.callee.type === 'MemberExpression' &&
                      node.parent.object.callee.object &&
                      node.parent.object.callee.object.type === 'Identifier' &&
                      node.parent.object.callee.property &&
                      node.parent.object.callee.property.type === 'Identifier' &&
                      node.parent.object.arguments
                    ) {

                      const argsList = gerArgumentsString(node.parent.object.arguments);
                      objectName = node.parent.object.callee.object.name + '.' + node.parent.object.callee.property.name +
                        '(' + argsList + ')';

                    } else if (
                      node.parent.object.object && node.parent.object.object.type === 'Identifier' &&
                      node.parent.object.property && node.parent.object.property.type === 'Identifier'
                    ) {
                      objectName = node.parent.object.property.name;
                    } else if (
                      node.parent.object.object && node.parent.object.object.type === 'ThisExpression' &&
                      node.parent.object.property && node.parent.object.property.type === 'Identifier'
                    ) {
                      objectName = node.parent.object.property.name;
                    } else if (
                      node.parent.object.name && node.parent.object.type === 'Identifier'
                    ) {
                      objectName = node.parent.object.name;
                    }

                    const skipNames = [
                      'elasticdump', 'server',
                      'request', 'req',
                      'response', 'resp',
                      'worker', 'sender', 'process', 'lifecycle', 'cluster',
                      'stream', 'readStream', 'writeStream', 'readable', 'scrollStream', 'csvStream',
                      'spawn', 'stderr', 'stdout',
                      'segmented', 'watcher', 'zipfile', 'rl', 'esStatus'
                    ];

                    if (skipNames.indexOf(objectName) !== -1) {
                      return;
                    }

                    const foundOn = objectName + `.on('` + eventName + `', ...`;

                    let expectedEventName = eventName;

                    if ((typeof eventName === 'string' || eventName instanceof String) && eventName.indexOf('.')) {
                      // event with namespace cut everything before the last '.'
                      const lastDotIndex = eventName.lastIndexOf('.');
                      expectedEventName = eventName.substring(lastDotIndex);
                    }

                    const expectedOff1 = objectName + `.off('` + expectedEventName + `', ...`;
                    const expectedOff1a = objectName + `.off("` + expectedEventName + `", ...`;

                    const expectedOff2 = objectName + '.off()';
                    const expectedOff2a = objectName + '.removeAllListeners()';
                    const expectedOff3 = objectName + '.destroy()';
                    const expectedOff4 = objectName + `.removeListener('` + eventName + `', ...`;
                    const expectedOff4a = objectName + `.removeListener("` + eventName + `", ...`;
                    const expectedOff5 = objectName + `.removeEventListener('` + eventName + `', ...`;
                    const expectedOff5a = objectName + `.removeEventListener("` + eventName + `", ...`;


                    const escapedObjectName = objectName ?
                      objectName.replace('$', '\\$').replace('.', '\\.').replace('(', '\\(').replace(')', '\\)') :
                      objectName;

                    const regexText1 = escapedObjectName + '\\.off\\(\'' + expectedEventName + '\'';
                    const regexText1a = escapedObjectName + '\\.off\\("' + expectedEventName + '"';
                    const regexText2 = escapedObjectName + '\\.off\\(\\)';
                    const regexText2a = escapedObjectName + '\\.removeAllListeners\\(\\)';
                    const regexText3 = escapedObjectName + '\\.destroy\\(\\)';
                    const regexText4 = escapedObjectName + '\\.removeListener\\(\'' + eventName + '\'';
                    const regexText4a = escapedObjectName + '\\.removeListener\\("' + eventName + '"';
                    const regexText5 = escapedObjectName + '\\.removeEventListener\\(\'' + eventName + '\'';
                    const regexText5a = escapedObjectName + '\\.removeEventListener\\("' + eventName + '"';

                    const regex1 = RegExp(regexText1, 'g');
                    const regex1a = RegExp(regexText1a, 'g');
                    const regex2 = RegExp(regexText2, 'g');
                    const regex2a = RegExp(regexText2a, 'g');
                    const regex3 = RegExp(regexText3, 'g');
                    const regex4 = RegExp(regexText4, 'g');
                    const regex4a = RegExp(regexText4a, 'g');
                    const regex5 = RegExp(regexText5, 'g');
                    const regex5a = RegExp(regexText5a, 'g');

                    const sourceCode = context.getSourceCode();

                    const foundOff1 = regex1.test(sourceCode.text);
                    const foundOff1a = regex1a.test(sourceCode.text);
                    const foundOff2 = regex2.test(sourceCode.text);
                    const foundOff2a = regex2a.test(sourceCode.text);
                    const foundOff3 = regex3.test(sourceCode.text);
                    const foundOff4 = regex4.test(sourceCode.text);
                    const foundOff4a = regex4a.test(sourceCode.text);
                    const foundOff5 = regex5.test(sourceCode.text);
                    const foundOff5a = regex5a.test(sourceCode.text);

                    if (debug) {
                      console.log(foundOff1 + ' ' + regexText1);
                      console.log(foundOff1a + ' ' + regexText1a);
                      console.log(foundOff2 + ' ' + regexText2);
                      console.log(foundOff2a + ' ' + regexText2a);
                      console.log(foundOff3 + ' ' + regexText3);
                      console.log(foundOff4 + ' ' + regexText4);
                      console.log(foundOff4 + ' ' + regexText4a);
                      console.log(foundOff5 + ' ' + regexText5);
                      console.log(foundOff5a + ' ' + regexText5a);
                    }

                    if (!(
                      foundOff1 || foundOff1a ||
                      foundOff2 || foundOff2a ||
                      foundOff3 ||
                      foundOff4 || foundOff4a ||
                      foundOff5 || foundOff5a
                    )) {
                      context.report({
                        node: node,
                        message:
                          'Possible memory leak. \n' +
                          'Found ' + foundOn + '\n' +
                          'Could not find corresponding: \n' +
                          expectedOff1 + '\n' +
                          expectedOff1a + '\n' +
                          expectedOff2 + '\n' +
                          expectedOff2a + '\n' +
                          expectedOff3 + '\n' +
                          expectedOff4 + '\n' +
                          expectedOff4a + '\n' +
                          expectedOff5 + '\n' +
                          expectedOff5a
                      });
                    }
                  }
                }
              }
            }
          }
        };
      }
    }
  }
};

