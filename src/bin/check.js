const utils = require('../lib/utils');

const validatePackageLock = (cache, callback) => {
  utils.getPackageLockHash((err, current) => {
    if (err) {
      return callback(err);
    }
    if (cache.verified_hash !== current) {
      return callback(new Error('The "package-lock.json" has not been verified. Run `npx @medic/audit-dependencies audit` to verify your dependencies.'));
    }
    callback();
  });
};

module.exports = callback => {
  utils.getCache((err, cache) => {
    if (err) {
      return callback(err);
    }
    validatePackageLock(cache, err => {
      if (err) {
        return callback(err);
      }
      console.log('The "package-lock.json" matches the previously verified version.');
      callback();
    });
  });
};
