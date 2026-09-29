import {cleanGoneBranchesWithSubmodules} from '../helpers/clean-branches';
import {colorize, ColorKeys} from '../helpers/shell-colors';
import {getRepositoryName, getWorkspaceRepositoriesList} from './helpers/repositories';

const isDryRun = process.argv.slice(2).some(argument => ['--dry', 'true'].includes(argument));

if (isDryRun) {
  console.info(colorize('⚠️  Dry mode: branches to be removed are only listed\n', ColorKeys.YELLOW));
}

const errors: {message: string; repository: string}[] = [];
const goneCurrentBranchPaths: string[] = [];

for (const repository of getWorkspaceRepositoriesList()) {
  const repositoryName = getRepositoryName(repository);
  console.info(`${colorize('Cleaning', ColorKeys.GREEN)} ${colorize(repositoryName, ColorKeys.YELLOW)}`);

  try {
    goneCurrentBranchPaths.push(...cleanGoneBranchesWithSubmodules(repository, {isDryRun}));
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❗ ${message}`);
    errors.push({message, repository: repositoryName});
  }
}

if (goneCurrentBranchPaths.length) {
  console.info(`\n${colorize('Current branch has gone, switch to another branch to remove it:', ColorKeys.YELLOW)}`);
  for (const goneCurrentBranchPath of goneCurrentBranchPaths) {
    console.info(`  ${goneCurrentBranchPath}`);
  }
}

if (errors.length) {
  console.info(`\n${colorize('Errors encountered:', ColorKeys.RED)}`);
  for (const {message, repository} of errors) {
    console.info(`  ${colorize(repository, ColorKeys.YELLOW)}: ${message}`);
  }
  process.exit(1);
}

console.info(colorize('\n🎉 Finished, every repository is clean', ColorKeys.GREEN));
