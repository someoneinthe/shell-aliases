import {execSync, ExecSyncOptionsWithStringEncoding} from 'node:child_process';
import {colorize, ColorKeys} from './shell-colors';

// Check 1.1234.12a, or backoffice-1.2.3a, or v1.2.3 tag format. DO NOT ADD 'global (/g)' flag, it leads to false results
export const gitSemVersionTagFormat = /^(([a-z-]+-)|v)?(?:\d{1,4}\.){2}\d{1,2}[a-z]?$/;

export const fetchBranches = (): void => {
  try {
    execSync('git fetch -p').toString();
  }
  catch {
    throw new Error('Can\'t fetch remotes branches.');
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
    throw new Error('Can\'t list remotes branches.');
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
    throw new Error(`Can't switch to branch ${branchToSwitch}, maybe you should stash your work first`);
  }
};

export const getLocalBranchesList = (willKeepAllBranches = true): string[] => {
  try {
    return execSync('git branch -vv').toString()
      .trim()
      .split('\n')
      .filter(rawLine => willKeepAllBranches || rawLine.includes(': gone]'))
      // worktrees branches => ignore
      .filter(rawLine => !rawLine.startsWith('+'))
      // trim, remove the '*' selector for current branch, and return the branch name
      .map(line => line.trim().replace(/^\*\s+/, '').replace(/\s.*/, ''))
      .filter(branchName => !!branchName);
  }
  catch {
    throw new Error('Can\'t get locale branches');
  }
};

export const getCurrentBranchName = (): string => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  }
  catch {
    throw new Error('Can\'t get current branch.');
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

export const updateSubmodules = (): void => {
  try {
    execSync('git submodule update --init --recursive').toString();
  }
  catch {
    throw new Error('Can\'t update submodules.');
  }
};

export const getSubmodulePaths = (): string[] => {
  try {
    const output = execSync('git submodule foreach --recursive --quiet pwd').toString().trim();
    if (!output) {
      return [];
    }
    return output.split('\n').map(line => line.trim()).filter(Boolean);
  }
  catch {
    return [];
  }
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
