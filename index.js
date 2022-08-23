const fs = require('fs');
const path = require('path');
const recommended = require('./configs/recommended');
const memoryLeak = require('./rules/memory-leak/memory-leak');
const sameCoreDependencyVersion = require('./rules/same-core-dependency-version/same-core-dependency-version');
const nolookbehind = require('./rules/nolookbehind/nolookbehind');
const promiseAll = require('./rules/promise-all/promise-all');

module.exports = {
  configs: {
    recommended
  },
  rules: {
    'memory-leak': memoryLeak,
    'same-core-dependency-version': sameCoreDependencyVersion,
    'nolookbehind': nolookbehind,
    'promise-all': promiseAll
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





