import {execSync, ExecSyncOptionsWithStringEncoding} from 'node:child_process';
import {colorize, ColorKeys} from './shell-colors';

// Check 1.1234.12a, or backoffice-1.2.3a tag format
export const gitTagFormat = /^([a-z-]+-)?(?:\d{1,4}\.){2}\d{1,2}[a-z]?$/gi;

export const fetchBranches = (): void => {
  try {
    execSync('git fetch -p').toString();
  }
  catch {
    console.log(colorize('❗️ Can\'t fetch remotes branches.', ColorKeys.RED));
    process.exit(1);
  }
};

export const getRemoteBranchesList = (): string[] => {
  fetchBranches();

  try {
    return execSync('git branch -r').toString()
      .trim()
      .split('\n');
  }
  catch {
    console.log(colorize('❗️ Can\'t list remotes branches.', ColorKeys.RED));
    process.exit(1);
  }
};

export const getUncommittedFilesList = (): string[] => execSync('git status').toString()
  .trim()
  .split('\n')
  .filter(line => line.startsWith('\t'))
  .map(line => line.trim().replaceAll('\t', ''));

export const switchLocalBranch = (branchToSwitch: string): void => {
  fetchBranches();

  try {
    execSync(`git switch ${branchToSwitch}`);
  }
  catch {
    console.info(colorize(`❗️ Can't switch to branch ${branchToSwitch}, maybe you should stash your work first`, ColorKeys.RED));
    process.exit(1);
  }
};

export const getLocalBranchesList = (willKeepAllBranches = true): string[] => {
  try {
    return execSync('git branch -vv').toString()
      .trim()
      .split('\n')
      .filter(rawLine => willKeepAllBranches || rawLine.includes(': gone]'))
      // trim, remove the '*' selector for current branch, and return the branch name
      .map(line => line.trim().replace(/^\*\s+/, '').replace(/\s.*/, ''))
      .filter(branchName => !!branchName);
  }
  catch {
    console.log(colorize('❗️ Can\'t get locale branches', ColorKeys.RED));
    process.exit(1);
  }
};

export const getCurrentBranchName = (): string => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  }
  catch {
    console.log(colorize('❗️ Can\'t get current branch.', ColorKeys.RED));
    process.exit(1);
  }
};

export const getTagsList = (): string[] => {
  fetchBranches();

  return execSync('git tag --sort=committerdate').toString()
    .trim()
    .split('\n')
    .filter(Boolean)
    .toReversed();
};

export const createAndPushTag = (tagName: string): void => {
  execSync(`git tag ${tagName} && git push origin ${tagName}`).toString();
};

export const rebaseLocaleBranch = ({branchName, willDisplayInformation = true}: {branchName: string; willDisplayInformation?: boolean}): void => {
  const outputOptions: Partial<ExecSyncOptionsWithStringEncoding> = willDisplayInformation ? {} : {stdio: 'pipe'};

  const errors = {
    conflict: false,
    noUpstream: false,
  };

  try {
    execSync(`git rebase origin/${branchName}`, outputOptions).toString();
  }
  catch {
    errors.conflict = true;
    try {
      execSync('git rebase --abort', outputOptions).toString();
    }
    catch {
      errors.noUpstream = true;
    }
    finally {
      if (errors.noUpstream) {
        console.log(colorize('⚠️️ Can\'t rebase branch. Your branch has probably gone', ColorKeys.YELLOW));
      }
      else {
        console.log(colorize('⚠️️ Can\'t rebase branch. Your branch has probably conflicts, or you have modified files', ColorKeys.YELLOW));
      }
    }
  }
};
