const { execSync } = require('child_process');

module.exports = {
  meta: {
    type: 'problem'
  },
  create: context => {
    // Get the newly added files and create a set of their names
    const newFiles = new Set(execSync('git diff --cached --name-only --diff-filter=A').toString().trim().split('\n'));
    // Remove the present working directory name to get the relative path. Because the above git command gives the relative path
    const filename = context.getFilename().replace(`${process.cwd()}/`, '');
    // If it's a NEW test file then we check it's content and look for an import from enzyme
    if ((filename.includes('.test.') || filename.includes('__tests__')) && newFiles.has(filename)) {
      const line = context.getSourceCode().lines.findIndex(line => line.includes(`from 'enzyme'`));
      if (line != -1) {
        context.report({
          message: 'Creating Enzyme tests is not allowed. Create a Cypress component test instead',
          loc: { start: { line, column: 0 } }
        })
      }
    }
    return {};
  }
}
