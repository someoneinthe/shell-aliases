#!/usr/bin/env node

const {execSync} = require('node:child_process');
const {colorize, colorKeys} = require('./helpers/colors');

const getLocalRemovedBranches = () => {
  try {
    return execSync('git fetch -p && git branch -vv | grep \'origin/.*: gone]\'').toString()
  } catch {
    console.log(colorize('Can\'t fetch remotes branches.', colorKeys.red));
    return '';
  }
}

const getCurrentBranchName = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString()
  } catch {
    console.log(colorize('Can\'t get current branch.', colorKeys.red));

    return '';
  }
}

const currentBranch = getCurrentBranchName();

getLocalRemovedBranches()
  .split('\n')
  .map(line => line.trim().replace(/\s.*/, ''))
  .filter(branchName => !!branchName && branchName !== currentBranch)
  .forEach(branchName => {
    branchName === currentBranch && console.log(colorize('Your current branch as gone. Switch another branch to remove it', colorKeys.yellow));

    console.log(execSync(`git branch -d -f ${branchName}`).toString());
  });

console.log('finished, everything is clean');
