import {execSync} from 'node:child_process';
import prompts from 'prompts';
import {
  createAndPushTag,
  getCurrentBranchName,
  getTagsList,
  getUncommittedFilesList,
  gitTagFormat,
  rebaseLocaleBranch,
  switchLocalBranch,
} from '../helpers/git';
import {colorize, colorKeys} from '../helpers/shell-colors';

/**
 * @description Generate and push a version.
 * This script will ask you to choose a service and a version type to release.
 * It will switch to master, rebase all merged commits, create a tag and push it.
 * It will also display the release log.
 */

const SHELL_ALIAS_DIR = process.env.SHELL_ALIAS_DIR;

const availableVersionNamePrefixes = [
  'api',
  'backoffice',
  'coworker-space',
  'pptx-generator',
];

const availableVersionTypes = [
  'major',
  'minor',
  'patch',
];

const releaseBranch = 'master';

const getNextVersion = (releasePrefix: string, releaseType: string, lastReleasedTag?: string) => {
  // no previous version, start from 1.0.0
  if (!lastReleasedTag) {
    return `${releasePrefix}-1.0.0`;
  }

  const currentReleaseVersionList = lastReleasedTag.replace(/\w+-/, '').split('.');

  let nextReleaseVersion;

  switch (releaseType) {
    case 'major': {
      nextReleaseVersion = `${Number(currentReleaseVersionList.at(0)) + 1}.0.0`;
      break;
    }
    case 'minor': {
      nextReleaseVersion = `${currentReleaseVersionList.at(0)}.${Number(currentReleaseVersionList.at(1)) + 1}.0`;
      break;
    }
    case 'patch': {
      nextReleaseVersion = `${currentReleaseVersionList.at(0)}.${currentReleaseVersionList.at(1)}.${Number(currentReleaseVersionList.at(2)?.replace(/\D/, '')) + 1}`;
      break;
    }
    default: {
      throw new Error(`Unknown release type ${releaseType}`);
    }
  }

  return `${releasePrefix}-${nextReleaseVersion}`;
};

console.info('ℹ️ This script will create a new tag, push it to the remote repository and extract the release log');

// Check if there are uncommitted files
if (getUncommittedFilesList().length) {
  console.error('❗ Your branch has uncommitted files. Please commit or stash them before creating a release');
  process.exit(0);
}

// Switch current branch if necessary
if (getCurrentBranchName() !== releaseBranch) {
  console.error('❗ You must be on the master branch to create a release');

  const {willSwitch} = await prompts({
    initial: true,
    message: `Do you want to switch to \`${releaseBranch}\`?`,
    name: 'willSwitch',
    type: 'confirm',
  }) as {willSwitch: boolean};

  if (willSwitch) {
    switchLocalBranch(releaseBranch);
  }
  else {
    process.exit(0);
  }
}

console.info('ℹ️ Those services are available for release:');
console.info(colorize(availableVersionNamePrefixes.join('\n'), colorKeys.blue));

const {releasePrefix} = await prompts({
  choices: availableVersionNamePrefixes.map(prefix => ({title: prefix, value: prefix})),
  message: 'Which service to release?',
  name: 'releasePrefix',
  type: 'select',
}) as {releasePrefix: string};

const lastTagForPrefix = getTagsList()
  .find(currentTag => gitTagFormat.test(currentTag) && currentTag.startsWith(releasePrefix));

if (lastTagForPrefix) {
  console.info(`ℹ️ Last tag for ${colorize(releasePrefix, colorKeys.yellow)} was ${colorize(lastTagForPrefix, colorKeys.yellow)}`);
}
else {
  console.info(colorize(`ℹ️ No previous tags found for ${releasePrefix}`, colorKeys.yellow));
}

console.info('ℹ️ Those version types are available for release:');
console.info(colorize(availableVersionTypes.join('\n'), colorKeys.blue));

const {releaseType} = await prompts({
  choices: availableVersionTypes.map(prefix => ({title: prefix, value: prefix})),
  message: 'Which version type to upgrade?',
  name: 'releaseType',
  type: 'select',
}) as {releaseType: string};

const nextReleaseVersionName = getNextVersion(releasePrefix, releaseType, lastTagForPrefix);

const {willPublish} = await prompts({
  initial: true,
  message: colorize(`ℹ️ The version \`${colorize(nextReleaseVersionName, colorKeys.yellow)}\` will be created and published, are you sure?`, colorKeys.blue),
  name: 'willPublish',
  type: 'confirm',
}) as {willPublish: boolean};

if (!willPublish) {
  process.exit(0);
}

// tag && push
rebaseLocaleBranch(releaseBranch);
createAndPushTag(nextReleaseVersionName);

// display releaselog
console.log(execSync(`node ${SHELL_ALIAS_DIR}/dist/supermood/release-log.js`).toString());

process.exit(0);
