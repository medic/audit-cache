const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const utils = require('../src/lib/utils');
const check = require('../src/bin/check');

describe('check', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('errors if cannot parse cache file', done => {
    sinon.stub(fs, 'readFile').callsArgWith(2, null, 'not json');
    check(err => {
      chai.expect(err && err.message).to.equal('Could not JSON parse .auditrc.json');
      chai.expect(fs.readFile.callCount).to.equal(1);
      done();
    });
  });

  it('errors if cache hash does not match the current hash', done => {
    const cache = { verified_hash: 'currentHash' };
    sinon.stub(fs, 'readFile').callsArgWith(2, null, JSON.stringify(cache));
    sinon.stub(utils, 'getPackageLockHash').callsArgWith(0, null, 'newHash');
    check(err => {
      chai.expect(err && err.message).to.equal('The "package-lock.json" has not been verified. Run `npx @medic/audit-dependencies audit` to verify your dependencies.');
      done();
    });
  });

  it('succeeds if cache hash does match the current hash', done => {
    const cache = { verified_hash: 'currentHash' };
    sinon.stub(fs, 'readFile').callsArgWith(2, null, JSON.stringify(cache));
    sinon.stub(utils, 'getPackageLockHash').callsArgWith(0, null, 'currentHash');
    check(err => {
      chai.expect(err).to.be.undefined;
      done();
    });
  });

});
