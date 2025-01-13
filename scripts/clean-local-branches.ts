import {execSync} from 'node:child_process';
import {getCurrentBranchName, getLocalBranchesList} from './helpers/git';
import {colorize, colorKeys} from './helpers/shell-colors';

/**
 * @description Clean local git branches that have been removed from remote
 *
 */
const currentBranch = getCurrentBranchName();

getLocalBranchesList()
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
