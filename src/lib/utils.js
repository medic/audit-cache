const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_FILENAME = '.auditrc.json';
const CACHE_FILE = path.join(process.cwd(), CACHE_FILENAME);
const EMPTY_CACHE = { permitted: [] };

const writeCache = (cache, callback) => {
  fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), callback);
};

const createBlankFile = callback => {
  writeCache(EMPTY_CACHE, err => {
    if (err) {
      return callback(err);
    }
    callback(null, EMPTY_CACHE);
  });
};

module.exports = {
  getPackageLockHash: callback => {
    const md5sum = crypto.createHash('md5');
    const stream = fs.ReadStream('package-lock.json');
    stream.on('data', d => md5sum.update(d));
    stream.on('end', () => callback(null, md5sum.digest('hex')));
  },
  getCache: callback => {
    fs.readFile(CACHE_FILE, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return createBlankFile(callback);
        }
        return callback(err);
      }
      try {
        data = JSON.parse(data);
      } catch(e) {
        return callback(new Error('Could not JSON parse .auditrc.json'));
      }
      callback(null, data);
    });
  },
  writeCache: writeCache,
  npmAudit: callback => {
    const npmAudit = childProcess.spawn('npm', [ 'audit', '--json' ]);
    let stdout = '';
    let stderr = '';
    npmAudit.stdout.on('data', data => stdout += data);
    npmAudit.stderr.on('data', data => stderr += data);
    npmAudit.on('close', () => {
      if (stderr) {
        return callback(new Error(stderr));
      }
      callback(null, stdout);
    });
  }
};
