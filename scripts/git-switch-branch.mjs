import {getRemoteBranchesList, switchLocalBranch} from './helpers/git.mjs';
import {colorize, colorKeys} from './helpers/shell-colors.mjs';

const [, , branchToFind] = process.argv;

if (!branchToFind) {
  console.log(colorize('❗️ No provided branch to switch', colorKeys.red));
  process.exit(1);
}

const foundBranches = getRemoteBranchesList()
  .map(line => line.trim().replace(/\s.*/, ''))
  .filter(data => !!data)
  .filter(branchName => branchName.includes(branchToFind))
  .map(branchName => branchName.replace(/origin\//, ''));

if (!foundBranches.length) {
  console.log(colorize(`⚠️ No branch found with given name "${branchToFind}"`, colorKeys.yellow));
}
else if (foundBranches.length === 1) {
  const [branchToSwitch] = foundBranches;

  switchLocalBranch(branchToSwitch);
}
else {
  // TODO ask user to choose branch with prompt autocomplete option
  console.log(colorize(`⚠️ Multiple branches found with given name "${branchToFind}":\n${foundBranches.join('\n ')}`, colorKeys.yellow));
}

console.log(colorize('✅ Finished', colorKeys.green));
process.exit(0);
