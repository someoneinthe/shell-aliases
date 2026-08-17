import {existsSync, readdirSync} from 'node:fs';
import path from 'node:path';
import prompts from 'prompts';
import {
  fetchBranches,
  getCurrentBranchName,
  getLocalBranchesList,
  getUncommittedFilesList,
  isWorktree,
  rebaseLocaleBranch,
  switchLocalBranch,
  updateSubmodules,
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
    .map(directory => path.resolve(currentPath, directory))
    // worktrees are updated through their main repository => ignore
    .filter(directory => !isWorktree(directory));

  repositoriesList.push(...subRepoList);
};

getSubRepoList(baseRepositoryPath);
getSubRepoList(workspacePath);

const errors: {message: string; repository: string}[] = [];

const processRepository = async (repository: string): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const repositoryName = repository.split('/').at(-1)!;
  console.info(`${colorize('Processing', ColorKeys.GREEN)} ${colorize(repositoryName, ColorKeys.YELLOW)}`);

  process.chdir(repository);

  try {
    fetchBranches();

    // Check if there are uncommitted files
    if (getUncommittedFilesList().length) {
      const message = 'Your branch has uncommitted files. This repository has been fetched, but branch will not be rebased';
      console.error(`❗ ${message}`);
      errors.push({message, repository: repositoryName});
      return;
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

    if (existsSync(path.resolve(repository, '.gitmodules'))) {
      updateSubmodules();
    }
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❗ ${message}`);
    errors.push({message, repository: repositoryName});
  }
};

for (const repository of repositoriesList) {
  await processRepository(repository);
}

if (errors.length) {
  console.info(`\n${colorize('Errors encountered:', ColorKeys.RED)}`);
  for (const {repository, message} of errors) {
    console.info(`  ${colorize(repository, ColorKeys.YELLOW)}: ${message}`);
  }
}
