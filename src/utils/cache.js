const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // TTL 5 menit

module.exports = {
  get: (key) => cache.get(key),
  set: (key, value) => cache.set(key, value),
  delete: (key) => cache.del(key)
};