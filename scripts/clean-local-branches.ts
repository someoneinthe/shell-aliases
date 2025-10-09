import {execSync} from 'node:child_process';
import {fetchBranches, getCurrentBranchName, getLocalBranchesList} from './helpers/git';
import {colorize, ColorKeys} from './helpers/shell-colors';

/**
 * @description Clean local git branches that have been removed from remote
 */
fetchBranches();

const currentBranch = getCurrentBranchName();

getLocalBranchesList(false)
  .forEach(branchName => {
    if (branchName === currentBranch) {
      console.log(colorize('⚠️  Your current branch has gone. Switch to another branch to remove it', ColorKeys.YELLOW));
    }
    else {
      console.log(execSync(`git branch -d -f ${branchName}`).toString());
    }
  });

console.log(colorize('🎉 Finished, everything is clean', ColorKeys.GREEN));

process.exit(0);
