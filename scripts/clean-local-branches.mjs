#!/usr/bin/env node

import {execSync} from 'node:child_process';
import {colorize, colorKeys} from './helpers/colors.mjs';
import {getCurrentBranchName, getLocalRemovedBranches} from "./helpers/git.mjs";

const currentBranch = getCurrentBranchName();

getLocalRemovedBranches()
  .split('\n')
  .filter(rawLine => rawLine.includes(': gone]'))
  .map(line => line.trim().replace(/\s.*/, ''))
  .filter(branchName => !!branchName && branchName !== currentBranch)
  .forEach(branchName => {
    branchName === currentBranch && console.log(colorize('⚠️ Your current branch as gone. Switch another branch to remove it', colorKeys.yellow));

    console.log(execSync(`git branch -d -f ${branchName}`).toString());
  });

console.log(colorize('🎉 Finished, everything is clean', colorKeys.green));
process.exit(0);
