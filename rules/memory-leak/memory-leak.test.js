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
    '$scope.on("some-event", console.log); $scope.off()',
    'myElement.on("click1", function () {}); myElement.off("click1", function () {})',
    'myElement.on("click2", function () {}); myElement.off("click2", function () {})',
    '$element.on("click3", function () {}); $element.off("click3", function () {})',
    'this.on("click4", function () {}); this.off("click4", function () {})',
    'this.boo.on("click5", function () {}); this.boo.off("click5", function () {})',
    '$scope.uiState.on("click6", function () {}); $scope.uiState.off("click6", function () {})',
    'this.aaa.bbb.ccc.on("click7", this.queryBarUpdateHandler); this.aaa.bbb.ccc.off("click7", this.queryBarUpdateHandler)',
    'angular.element(document.body).on("click9", handler); angular.element(document.body).off("click9", handler)',
    '$(document.body).on("click10", handler); $(document.body).off("click10", handler)',
    '$(this.target).on("click11", handler); $(this.target).off("click11", handler)',
    'myElement.recur().on("click12", handler);myElement.recur().off("click12", handler)',
    '$(document).on("click13", handler); $(document).off("click13", handler)',
    'this.boo.on("click.namespace", function () {}); this.boo.off(".namespace", function () {})'
  ],
  invalid: [
    { code: 'foo.on("some-event", console.log)', errors: [expectedError] },
    { code: '$scope.on("some-event", console.log)', errors: [expectedError] },
    { code: '$scope.on("some-event", console.log); unrelatedObject.off()', errors: [expectedError] }
  ]
});
