import path from 'node:path';
import {deleteLocalBranch, fetchBranches, getCurrentBranchName, getLocalBranchesList, getSubmodulePaths} from './git';
import {colorize, ColorKeys} from './shell-colors';

// never delete these branches, even if their upstream has gone
const PROTECTED_BRANCHES = new Set(['main', 'master']);

interface CleanBranchesOptions {
  isDryRun?: boolean;
}

/**
 * @description Fetch and prune remotes, then delete local branches whose upstream has gone, in the current working directory.
 * The current branch can't be deleted: it is only reported.
 * @returns the current branch name if it has gone, undefined otherwise
 */
export const cleanGoneBranches = ({isDryRun = false}: CleanBranchesOptions = {}): string | undefined => {
  fetchBranches();

  const currentBranch = getCurrentBranchName();
  let goneCurrentBranch: string | undefined;

  for (const branchName of getLocalBranchesList(false)) {
    if (branchName === currentBranch) {
      goneCurrentBranch = branchName;
      console.log(colorize(`  ⚠️  Your current branch ${branchName} has gone. Switch to another branch to remove it`, ColorKeys.YELLOW));
    }
    else if (PROTECTED_BRANCHES.has(branchName)) {
      console.log(colorize(`  ⚠️  Protected branch ${branchName} has gone, it will not be removed`, ColorKeys.YELLOW));
    }
    else if (isDryRun) {
      console.log(`  Would delete branch ${branchName}`);
    }
    else {
      console.log(`  ${deleteLocalBranch(branchName)}`);
    }
  }

  return goneCurrentBranch;
};

/**
 * @description Clean gone branches in a repository, then recursively in all its submodules.
 * @returns the paths (repository or submodules) whose current branch has gone
 */
export const cleanGoneBranchesWithSubmodules = (repositoryPath: string, options: CleanBranchesOptions = {}): string[] => {
  const initialPath = process.cwd();
  const goneCurrentBranchPaths: string[] = [];

  try {
    process.chdir(repositoryPath);

    if (cleanGoneBranches(options)) {
      goneCurrentBranchPaths.push(repositoryPath);
    }

    for (const submodulePath of getSubmodulePaths()) {
      console.log(colorize(`  submodule ${path.relative(repositoryPath, submodulePath)}`, ColorKeys.GREEN));
      process.chdir(submodulePath);

      if (cleanGoneBranches(options)) {
        goneCurrentBranchPaths.push(submodulePath);
      }
    }
  }
  finally {
    process.chdir(initialPath);
  }

  return goneCurrentBranchPaths;
};
