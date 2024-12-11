import {execSync} from 'node:child_process';
import {colorize, colorKeys} from './shell-colors.mjs';

// Check 1.1234.12a, or backoffice-1.2.3a tag format
export const gitTagFormat = /^([a-z-]+-)?(?:\d{1,4}\.){2}\d{1,2}[a-z]?$/gi;

const fetchBranches = () => {
  try {
    execSync('git fetch -p').toString();
  }
  catch {
    console.log(colorize('❗️ Can\'t fetch remotes branches.', colorKeys.red));
    process.exit(1);
  }
};

export const getRemoteBranchesList = () => {
  fetchBranches();

  try {
    return execSync('git branch -r').toString()
      .trim()
      .split('\n');
  }
  catch {
    console.log(colorize('❗️ Can\'t list remotes branches.', colorKeys.red));
    process.exit(1);
  }
};

export const getUncommittedFilesList = () => execSync('git status').toString().trim()
  .split('\n')
  .filter(line => line.startsWith('\t'))
  .map(line => line.trim().replaceAll('\t', ''));

export const switchLocalBranch = branchToSwitch => {
  fetchBranches();

  try {
    execSync(`git switch ${branchToSwitch}`);
  }
  catch {
    console.info(colorize(`❗️ Can't switch to branch ${branchToSwitch}, maybe you should stash your work first`, colorKeys.red));
    process.exit(1);
  }
};

export const getLocalBranchesList = () => {
  fetchBranches();

  try {
    return execSync('git branch -vv').toString()
      .trim()
      .split('\n');
  }
  catch {
    console.log(colorize('❗️ Can\'t get locale branches', colorKeys.red));
    process.exit(1);
  }
};

export const getCurrentBranchName = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  }
  catch {
    console.log(colorize('❗️ Can\'t get current branch.', colorKeys.red));
    process.exit(1);
  }
};

export const getTagsList = () => {
  fetchBranches();

  return execSync('git tag --sort=committerdate').toString()
    .trim()
    .split('\n')
    .filter(Boolean)
    .toReversed();
};

export const createAndPushTag = tagName => {
  execSync(`git tag ${tagName} && git push origin ${tagName}`).toString();
};

export const rebaseLocaleBranch = branchName => {
  execSync(`git rebase origin/${branchName}`).toString();
};
