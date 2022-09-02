const Sha256 = require('./sha256');

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
  return new Sha256().update(nodeString, 'utf8').digest('hex');
}

module.exports = createHash;
