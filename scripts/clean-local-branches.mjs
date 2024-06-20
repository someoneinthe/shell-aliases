import {execSync} from 'node:child_process';
import {colorize, colorKeys} from './helpers/colors.mjs';
import {getCurrentBranchName, getLocalRemovedBranches} from './helpers/git.mjs';

const currentBranch = getCurrentBranchName();

getLocalRemovedBranches()
  .split('\n')
  .filter(rawLine => rawLine.includes(': gone]'))
  // trim, remove the '*' selector for current branch, and return the branch name
  .map(line => line.trim().replace(/^\*\s+/, '').replace(/\s.*/, ''))
  .filter(branchName => !!branchName)
  .forEach(branchName => {
    if (branchName === currentBranch) {
      console.log(colorize('⚠️  Your current branch has gone. Switch to another branch to remove it', colorKeys.yellow));
    }
    else {
      console.log(execSync(`git branch -d -f ${branchName}`).toString());
    }
  });

console.log(colorize('🎉 Finished, everything is clean', colorKeys.green));
process.exit(0);
