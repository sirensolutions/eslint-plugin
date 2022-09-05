const crypto = require('crypto');

const getCircularReplacer = () => {
  const seen = new WeakSet(); // eslint-disable-line no-undef
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

function createHash(node) {
  const nodeString = JSON.stringify(node, getCircularReplacer());
  return crypto.createHash('sha256').update(nodeString).digest('hex');
}

module.exports = createHash;
