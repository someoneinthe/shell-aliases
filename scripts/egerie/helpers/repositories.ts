import {existsSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {isWorktree} from '../../helpers/git';

const BASE_REPO = 'unified-dev-stack';

/**
 * @description List the git repositories directly under a folder. Hidden folders and linked worktrees are ignored.
 */
export const getGitRepositoriesList = (parentPath: string): string[] => readdirSync(parentPath, {withFileTypes: true})
  // keep only not hidden folders
  .filter(fileOrDirectory => !fileOrDirectory.name.startsWith('.') && fileOrDirectory.isDirectory())
  // add full path
  .map(({name}) => path.resolve(parentPath, name))
  // keep if it's a git repository
  .filter(directory => existsSync(path.resolve(directory, '.git')))
  // worktrees are handled through their main repository => ignore
  .filter(directory => !isWorktree(directory));

/**
 * @description List the git repositories of the workspace: those of '$WORKSPACE/unified-dev-stack', then those of '$WORKSPACE'.
 */
export const getWorkspaceRepositoriesList = (): string[] => {
  const {WORKSPACE} = process.env;

  if (!WORKSPACE) {
    throw new Error('The WORKSPACE environment variable is not set.');
  }

  const workspacePath = path.resolve(WORKSPACE);
  const baseRepositoryPath = path.resolve(workspacePath, BASE_REPO);

  return [
    ...existsSync(baseRepositoryPath) ? getGitRepositoriesList(baseRepositoryPath) : [],
    ...getGitRepositoriesList(workspacePath),
  ];
};

/**
 * @description Get a repository display name from its path
 */
export const getRepositoryName = (repositoryPath: string): string => path.basename(repositoryPath);
