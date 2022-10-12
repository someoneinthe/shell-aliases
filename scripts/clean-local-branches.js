#!/usr/bin/env node

const {execSync} = require('node:child_process');

const getLocalBranches = () => {
  try {
    return execSync('git fetch -p && git branch -vv | grep \'origin/.*: gone]\'').toString()
  } catch {
    return '';
  }
}

const getCurrentBranchName = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString()
  } catch {
    return '';
  }
}

const currentBranch = getCurrentBranchName();

getLocalBranches()
  .split('\n')
  .map(line => line.trim().replace(/\s.*/, ''))
  .filter(branchName => !!branchName && branchName !== currentBranch)
  .forEach(data => console.log(execSync(`git branch -d -f ${data}`).toString()));
