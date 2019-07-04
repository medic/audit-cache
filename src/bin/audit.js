const utils = require('../lib/utils');

const audit = callback => {
  utils.npmAudit((err, output) => {
    if (err) {
      return callback(err);
    }
    try {
      output = JSON.parse(output);
    } catch(e) {
      callback(new Error(`Error parsing output from 'npm audit'`));
    }
    callback(null, output);
  });
};

const updateCache = (cache, callback) => {
  utils.getPackageLockHash((err, hash) => {
    if (err) {
      return callback(err);
    }
    cache.verified_hash = hash;
    utils.writeCache(cache, callback);
  });
};

const check = (audit, callback) => {
  utils.getCache((err, cache) => {
    if (err) {
      return callback(err);
    }
    const permitted = (cache && cache.permitted) || [];
    const warn = [];
    const error = [];
    Object.keys(audit.advisories).forEach(id => {
      if (permitted.includes(id)) {
        warn.push(id);
      } else {
        error.push(id);
      }
    });
    if (error.length) {
      return callback(new Error(`${error.length} unpermitted vulnerabilities found.`));
    }
    cache.permitted = warn;
    updateCache(cache, err => {
      if (err) {
        return callback(err);
      }
      callback();
    });
  });
};

module.exports = callback => {
  audit((err, audit) => {
    if (err) {
      return callback(err);
    }
    check(audit, err => {
      if (err) {
        return callback(err);
      }
      console.log('No unpermitted vulnerabilities found.');
      return callback();
    });
  });
};
