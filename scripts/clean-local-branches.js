#!/usr/bin/env node

const {execSync} = require('node:child_process');
const {colorize, colorKeys} = require('./helpers/colors');

const getLocalRemovedBranches = () => {
  try {
    return execSync('git fetch -p && git branch -vv').toString()
  } catch {
    console.log(colorize('Can\'t fetch remotes branches', colorKeys.red));
    process.exit(1);
  }
}

const getCurrentBranchName = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString()
  } catch {
    console.log(colorize('Can\'t get current branch.', colorKeys.red));

    process.exit(1);
  }
}

const currentBranch = getCurrentBranchName();

getLocalRemovedBranches()
  .split('\n')
  .filter(rawLine => rawLine.includes(': gone]'))
  .map(line => line.trim().replace(/\s.*/, ''))
  .filter(branchName => !!branchName && branchName !== currentBranch)
  .forEach(branchName => {
    branchName === currentBranch && console.log(colorize('Your current branch as gone. Switch another branch to remove it', colorKeys.yellow));

    console.log(execSync(`git branch -d -f ${branchName}`).toString());
  });

console.log(colorize('Finished, everything is clean', colorKeys.green));
