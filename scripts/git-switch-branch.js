#!/usr/bin/env node

const {execSync} = require('node:child_process');
const {colorize, colorKeys} = require('./helpers/colors');

const [, , branchToFind] = process.argv;

const getLocalBranches = () => {
  try {
    return execSync('git fetch -p && git branch -r').toString()
  } catch {
    console.log(colorize('Can\'t fetch remotes branches.', colorKeys.red));
    return '';
  }
}

if (!branchToFind) {
  console.log(colorize('No provided branch to switch', colorKeys.red));
} else {
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

    execSync(`git switch ${branchToSwitch}`);
  } else {
    console.log(colorize(`Multiple branches found with given name "${branchToFind}":\n${foundBranches.join('\n ')}`, colorKeys.yellow));
  }
}

console.log('finished');
