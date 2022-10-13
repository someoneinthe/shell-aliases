#!/usr/bin/env node

const {execSync} = require('node:child_process');
const {colorize, colorKeys} = require('./helpers/colors');

const [, , branchToFind] = process.argv;

const getLocalBranches = () => {
  try {
    return execSync('git fetch -p && git branch -r').toString()
  } catch {
    console.log(colorize('Can\'t fetch remotes branches.', colorKeys.red));
    process.exit(1);
  }
}

const switchLocalBranch = branchToSwitch => {
  try {
    return execSync(`git switch ${branchToSwitch}`);
  } catch {
    process.exit(1);
  }
}

if (!branchToFind) {
  console.log(colorize('No provided branch to switch', colorKeys.red));
  process.exit(1);
}

const foundBranches = getLocalBranches()
  .split('\n')
  .map(line => line.trim().replace(/\s.*/, ''))
  .filter(data => !!data)
  .filter(branchName => branchName.includes(branchToFind))
  .map(branchName => branchName.replace(/origin\//, ''));

if (!foundBranches.length) {
  console.log(colorize(`No branch found with given name "${branchToFind}"`, colorKeys.yellow));
} else if (foundBranches.length === 1) {
  const [branchToSwitch] = foundBranches;

  switchLocalBranch(branchToSwitch);
} else {
  console.log(colorize(`Multiple branches found with given name "${branchToFind}":\n${foundBranches.join('\n ')}`, colorKeys.yellow));
}


console.log(colorize('Finished', colorKeys.green));
