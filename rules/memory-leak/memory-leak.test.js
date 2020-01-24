const { RuleTester } = require('eslint');
const rule = require('./memory-leak');

const ruleTester = new RuleTester();

const expectedError = { ruleId: 'memory-leak', message: 'Event listener is never removed' };
ruleTester.run('memory-leak', rule, {
  valid: [
    'console.log("this is fine")',
    'object.on("$destroy", console.log)',
    'response.on("data", console.log)',
    'stdout.on("close", console.log)',
    'foo.on("some-event", console.log); foo.off("some-event")',
    '$scope.on("some-event", console.log); $scope.off()'
  ],
  invalid: [
    { code: 'foo.on("some-event", console.log)', errors: [expectedError] },
    { code: '$scope.on("some-event", console.log)', errors: [expectedError] },
    { code: '$scope.on("some-event", console.log)', errors: [expectedError] },
    { code: '$scope.on("some-event", console.log); unrelatedObject.off()', errors: [expectedError] }
  ]
});
