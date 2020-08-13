const path = require('path');

module.exports = {
  _prefix: 'module.exports = ',
  rules: {
    'memory-leak': require('./rules/memory-leak/memory-leak'),
    'same-core-dependency-version': require('./rules/same-core-dependency-version/same-core-dependency-version')
  },
  processors: {
    '.json': {
      preprocess: (text, filename) => {
        return path.basename(filename) === 'package.json' ? [text] : [];
        // return path.basename(filename) === 'package.json' ? [text] : [];
      },
      postprocess(messages) {
        const flattenedMessages = [].concat(...messages)
        return flattenedMessages.filter(error => !error.ruleId || error.ruleId === 'siren/same-core-dependency-version')
      },
    }
  }
};





