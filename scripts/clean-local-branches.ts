import {cleanGoneBranchesWithSubmodules} from './helpers/clean-branches';
import {colorize, ColorKeys} from './helpers/shell-colors';

/**
 * @description Clean local git branches that have been removed from remote, in the current repository and any submodules.
 */
const isDryRun = process.argv.slice(2).some(argument => ['--dry', 'true'].includes(argument));

if (isDryRun) {
  console.log(colorize('⚠️  Dry mode: branches to be removed are only listed', ColorKeys.YELLOW));
}

console.log(colorize('🔍 Cleaning main repository', ColorKeys.GREEN));
cleanGoneBranchesWithSubmodules(process.cwd(), {isDryRun});

console.log(colorize('🎉 Finished, everything is clean', ColorKeys.GREEN));

process.exit(0);
