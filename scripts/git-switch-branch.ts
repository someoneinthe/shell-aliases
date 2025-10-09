import prompts from 'prompts';
import {getRemoteBranchesList, switchLocalBranch} from './helpers/git';
import {colorize, ColorKeys} from './helpers/shell-colors';

const [, , branchToFind] = process.argv;

if (!branchToFind) {
  console.log(colorize('❗️ No provided branch to switch', ColorKeys.RED));
  process.exit(1);
}

const foundBranches = getRemoteBranchesList()
  .map(line => line.trim().replace(/\s.*/, ''))
  .filter(branchName => !!branchName && branchName.includes(branchToFind))
  .map(branchName => branchName.replace(/origin\//, ''));

const getBranchToSwitch = async (branchesList: string[]) => {
  switch (branchesList.length) {
    case 0: {
      console.log(colorize(`⚠️ No branch found with given name "${branchToFind}"`, ColorKeys.YELLOW));

      return '';
    }
    case 1: {
      const [switchingBranch] = branchesList;

      return switchingBranch;
    }
    default: {
      console.log(colorize(`⚠️ ${branchesList.length} branches found with given name`, ColorKeys.YELLOW));

      const {branchToSwitch: switchingBranch} = await prompts({
        choices: branchesList.map(branchName => ({title: branchName, value: branchName})),
        message: 'Which branch to switch on?',
        name: 'branchToSwitch',
        type: 'select',
      }) as {branchToSwitch: string};

      return switchingBranch;
    }
  }
};

const branchToSwitch = await getBranchToSwitch(foundBranches);

if (branchToSwitch) {
  switchLocalBranch(branchToSwitch);
  console.log(colorize('✅ Finished', ColorKeys.GREEN));
}

process.exit(0);
