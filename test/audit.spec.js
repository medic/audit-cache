const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const utils = require('../src/lib/utils');
const audit = require('../src/bin/audit');

describe('audit', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('errors if cannot parse cache file', done => {
    sinon.stub(utils, 'npmAudit').callsArgWith(0, null, '{ "advisories": {} }');
    sinon.stub(fs, 'readFile').callsArgWith(2, null, 'not json');
    audit(err => {
      chai.expect(err && err.message).to.equal('Could not JSON parse .auditrc.json');
      chai.expect(utils.npmAudit.callCount).to.equal(1);
      chai.expect(fs.readFile.callCount).to.equal(1);
      done();
    });
  });

  it('updates cache with new hash', done => {
    const original = { permitted: [] };
    const updated = { verified_hash: 'myhash', permitted: [] };
    sinon.stub(utils, 'npmAudit').callsArgWith(0, null, '{ "advisories": {} }');
    sinon.stub(fs, 'readFile').callsArgWith(2, null, JSON.stringify(original));
    sinon.stub(fs, 'writeFile').callsArg(2);
    sinon.stub(utils, 'getPackageLockHash').callsArgWith(0, null, 'myhash');
    audit(err => {
      chai.expect(err).to.be.undefined;
      chai.expect(fs.writeFile.callCount).to.equal(1);
      chai.expect(JSON.parse(fs.writeFile.args[0][1])).to.deep.equal(updated);
      done();
    });
  });

  it('updates permitted list if advisories have been resolved', done => {
    const original = { permitted: [ '1', '2' ] };
    const updated = { verified_hash: 'myhash', permitted: [ '2' ] };
    sinon.stub(utils, 'npmAudit').callsArgWith(0, null, '{ "advisories": { "2": {} } }');
    sinon.stub(fs, 'readFile').callsArgWith(2, null, JSON.stringify(original));
    sinon.stub(fs, 'writeFile').callsArg(2);
    sinon.stub(utils, 'getPackageLockHash').callsArgWith(0, null, 'myhash');
    audit(err => {
      chai.expect(err).to.be.undefined;
      chai.expect(fs.writeFile.callCount).to.equal(1);
      chai.expect(JSON.parse(fs.writeFile.args[0][1])).to.deep.equal(updated);
      done();
    });
  });

  it('fails if new unpermitted vulnerabilities found', done => {
    const original = { permitted: [ '1' ] };
    sinon.stub(utils, 'npmAudit').callsArgWith(0, null, '{ "advisories": { "2": {} } }');
    sinon.stub(fs, 'readFile').callsArgWith(2, null, JSON.stringify(original));
    sinon.stub(fs, 'writeFile');
    audit(err => {
      chai.expect(err.message).to.equal('1 unpermitted vulnerabilities found.');
      chai.expect(fs.writeFile.callCount).to.equal(0);
      done();
    });
  });

});
