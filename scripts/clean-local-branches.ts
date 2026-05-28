import {execSync} from 'node:child_process';
import {fetchBranches, getCurrentBranchName, getLocalBranchesList, getSubmodulePaths} from './helpers/git';
import {colorize, ColorKeys} from './helpers/shell-colors';

/**
 * @description Clean local git branches that have been removed from remote, in the current repository and any submodules.
 */
const cleanGoneBranches = (label: string): void => {
  console.log(colorize(`🔍 Cleaning ${label}`, ColorKeys.GREEN));

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
};

const rootRepository = process.cwd();

cleanGoneBranches('main repository');

const submodulePaths = getSubmodulePaths();
for (const submodulePath of submodulePaths) {
  process.chdir(submodulePath);
  cleanGoneBranches(`submodule ${submodulePath}`);
}

process.chdir(rootRepository);

console.log(colorize('🎉 Finished, everything is clean', ColorKeys.GREEN));

process.exit(0);
