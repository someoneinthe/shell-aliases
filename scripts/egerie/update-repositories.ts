import {existsSync, readdirSync} from 'node:fs';
import path from 'node:path';
import prompts from 'prompts';
import {
  fetchBranches,
  getCurrentBranchName,
  getLocalBranchesList,
  getUncommittedFilesList,
  rebaseLocaleBranch,
  switchLocalBranch,
} from '../helpers/git';
import {colorize, ColorKeys} from '../helpers/shell-colors';

const BASE_REPO = 'unified-dev-stack';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const workspacePath = path.resolve(process.env.WORKSPACE!);
const baseRepositoryPath = path.resolve(workspacePath, BASE_REPO);

const repositoriesList: string[] = [];

const getSubRepoList = (currentPath: string) => {
  const subRepoList = readdirSync(currentPath, {withFileTypes: true})
    // keep only not hidden folders
    .filter(fileOrDirectory => !fileOrDirectory.name.startsWith('.') && fileOrDirectory.isDirectory())
    .map(({name}) => name)
    // keep if it's a git repository
    .filter(directory => existsSync(path.resolve(currentPath, directory, '.git')))
    // add full path
    .map(directory => path.resolve(currentPath, directory));

  repositoriesList.push(...subRepoList);
};

getSubRepoList(baseRepositoryPath);
getSubRepoList(workspacePath);

for (const repository of repositoriesList) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  console.info(`${colorize('Processing', ColorKeys.GREEN)} ${colorize(repository.split('/').at(-1)!, ColorKeys.YELLOW)}`);

  process.chdir(repository);

  fetchBranches();

  // Check if there are uncommitted files
  if (getUncommittedFilesList().length) {
    console.error('❗ Your branch has uncommitted files. This repository has been fetched, but branch will not be rebased');
    break;
  }

  const currentBranch = getCurrentBranchName();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const mainBranchName = getLocalBranchesList().find(branchName => ['main', 'master'].includes(branchName))!;

  if (currentBranch !== mainBranchName) {
    const {willSwitch} = await prompts({
      initial: true,
      message: `${colorize('You are on the branch', ColorKeys.YELLOW)} ${colorize(currentBranch, ColorKeys.GREEN)}${colorize(', do you want to switch branch before?', ColorKeys.YELLOW)}`,
      name: 'willSwitch',
      type: 'confirm',
    }) as {willSwitch: boolean};

    if (willSwitch) {
      switchLocalBranch(mainBranchName);
    }
  }

  rebaseLocaleBranch({branchName: currentBranch, willDisplayInformation: false});
}
