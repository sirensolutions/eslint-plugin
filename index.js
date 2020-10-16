const fs = require('fs');
const path = require('path');
const memoryLeak = require('./rules/memory-leak/memory-leak');
const sameCoreDependencyVersion = require('./rules/same-core-dependency-version/same-core-dependency-version');

module.exports = {
  rules: {
    'memory-leak': memoryLeak,
    'same-core-dependency-version': sameCoreDependencyVersion
  },
  processors: {
    '.json': {
      preprocess: (text, filename) => {
        if (path.basename(filename) === 'package.json') {
          sameCoreDependencyVersion.registerPackageJsonContents(fs.readFileSync(filename, 'utf-8'));
        }
        return [''];
      },
      postprocess(messages) {
        const flattenedMessages = [].concat(...messages)
        return flattenedMessages.filter(error => !error.ruleId || error.ruleId === 'siren/same-core-dependency-version')
      },
    }
  }
};





