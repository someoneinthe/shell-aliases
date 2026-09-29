import {execFileSync, execSync, ExecSyncOptionsWithStringEncoding} from 'node:child_process';
import {existsSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {colorize, ColorKeys} from './shell-colors';

// Check 1.1234.12a, or backoffice-1.2.3a, or v1.2.3 tag format. DO NOT ADD 'global (/g)' flag, it leads to false results
export const gitSemVersionTagFormat = /^(([a-z-]+-)|v)?(?:\d{1,4}\.){2}\d{1,2}[a-z]?$/;

/**
 * @description Reject a git reference coming from user input if it could be interpreted as a git option
 */
const assertSafeReference = (reference: string): void => {
  if (!reference || reference.startsWith('-')) {
    throw new Error(`Invalid git reference: '${reference}'`);
  }
};

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
  assertSafeReference(branchToSwitch);
  fetchBranches();

  try {
    execFileSync('git', ['switch', branchToSwitch]);
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

export const deleteLocalBranch = (branchName: string): string => {
  assertSafeReference(branchName);

  try {
    return execFileSync('git', ['branch', '-D', branchName], {stdio: 'pipe'}).toString().trim();
  }
  catch {
    throw new Error(`Can't delete branch ${branchName}`);
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

export const isWorktree = (repositoryPath: string): boolean => {
  const gitPath = path.resolve(repositoryPath, '.git');

  // a regular repository has a '.git' directory, only linked worktrees and submodules have a '.git' file
  if (!existsSync(gitPath) || !statSync(gitPath).isFile()) {
    return false;
  }

  // a worktree '.git' file targets '<main repository>/.git/worktrees/<name>', a submodule one targets '.git/modules/<name>'
  const gitDirectory = readFileSync(gitPath, 'utf8').trim().replace(/^gitdir:\s*/, '');

  return path.basename(path.dirname(gitDirectory)) === 'worktrees';
};

export const rebaseLocaleBranch = ({branchName, willDisplayInformation = true}: {branchName: string; willDisplayInformation?: boolean}): void => {
  const outputOptions: Partial<ExecSyncOptionsWithStringEncoding> = willDisplayInformation ? {} : {stdio: 'pipe'};

  const errors = {
    conflict: false,
    noUpstream: false,
  };

  try {
    assertSafeReference(branchName);
    execFileSync('git', ['rebase', `origin/${branchName}`], outputOptions);
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
