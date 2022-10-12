#!/usr/bin/env node

const {execSync} = require('node:child_process');

const [, , branchToFind] = process.argv;

const getLocalBranches = () => {
  try {
    return execSync('git fetch -p && git branch -r').toString()
  } catch {
    return ''
  }
}

const foundBranches = getLocalBranches()
  .split('\n')
  .map(line => line.trim().replace(/\s.*/, ''))
  .filter(data => !!data)
  .filter(branchName => branchName.includes(branchToFind))
  .map(branchName => branchName.replace(/origin\//, ''));

if (!foundBranches.length) {
  console.log(`No branch found with given name "${branchToFind}"`);
} else if (foundBranches.length === 1) {
  const [branchToSwitch] = foundBranches;

  execSync(`git switch ${branchToSwitch}`);
} else {
  console.log(`Multiple branches found with given name "${branchToFind}":\n${foundBranches.join('\n ')}`);
}
