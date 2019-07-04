#!/usr/bin/env node
const COMMANDS = {
  check: require('./bin/check'),
  audit: require('./bin/audit'),
};

const usage = () => {
  console.log('To use this function provide pass either "check" or "audit" as parameters. For more information read the README.md');
};

if (process.argv < 2) {
  return usage();
}
const cmd = COMMANDS[process.argv[2]];
if (!cmd) {
  return usage();
}
cmd(err => {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }
});
