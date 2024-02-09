#!/usr/bin/env node

import {colorize, colorKeys} from './helpers/colors.mjs';
import {getRemoteBranches, switchLocalBranch} from "./helpers/git.mjs";

const [, , branchToFind] = process.argv;

if (!branchToFind) {
  console.log(colorize('❗️ No provided branch to switch', colorKeys.red));
  process.exit(1);
}

const foundBranches = getRemoteBranches()
  .split('\n')
  .map(line => line.trim().replace(/\s.*/, ''))
  .filter(data => !!data)
  .filter(branchName => branchName.includes(branchToFind))
  .map(branchName => branchName.replace(/origin\//, ''));

if (!foundBranches.length) {
  console.log(colorize(`⚠️ No branch found with given name "${branchToFind}"`, colorKeys.yellow));
} else if (foundBranches.length === 1) {
  const [branchToSwitch] = foundBranches;

  switchLocalBranch(branchToSwitch);
} else {
  console.log(colorize(`⚠️ Multiple branches found with given name "${branchToFind}":\n${foundBranches.join('\n ')}`, colorKeys.yellow));
}

console.log(colorize('✅ Finished', colorKeys.green));
process.exit(0);
