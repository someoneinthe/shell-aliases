import {execSync} from 'node:child_process';
import promptSync from 'prompt-sync';
import {colorize, colorKeys} from '../helpers/colors.mjs';
import {
  createAndPushTag,
  getCurrentBranchName,
  getTagsList,
  getUncommittedFiles,
  gitTagFormat,
  rebaseLocaleBranch,
  switchLocalBranch,
} from '../helpers/git.mjs';

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

const getNextVersion = (releasePrefix, releaseType, lastReleasedTag) => {
  // no previous version, start from 1.0.0
  if (!lastReleasedTag) {
    return `${releasePrefix}-1.0.0`;
  }

  const currentReleaseVersionList = lastReleasedTag?.replace(/\w+-/, '').split('.');

  let nextReleaseVersion = currentReleaseVersionList.join('.');

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
      nextReleaseVersion = `${currentReleaseVersionList.at(0)}.${currentReleaseVersionList.at(1)}.${Number(currentReleaseVersionList.at(2).replace(/\D/, '')) + 1}`;
      break;
    }
    default: {
      throw new Error(`Unknown release type ${releaseType}`);
    }
  }

  return `${releasePrefix}-${nextReleaseVersion}`;
};

const prompt = promptSync({sigint: true});

console.info('ℹ️ This script will create a new tag, push it to the remote repository and extract the release log');

// Check if there are uncommitted files
if (getUncommittedFiles().length) {
  console.error('❗ Your branch has uncommitted files. Please commit or stash them before creating a release');
  process.exit(0);
}

// Switch current branch if necessary
if (getCurrentBranchName() !== releaseBranch) {
  console.error('❗ You must be on the master branch to create a release');

  if (['', 'y'].includes(prompt(`Do you want to switch to \`${releaseBranch}\`? (y)`))) {
    switchLocalBranch(releaseBranch);
  }
  else {
    process.exit(0);
  }
}

console.info('ℹ️ Those services are available for release:');
console.info(colorize(availableVersionNamePrefixes.join('\n'), colorKeys.blue));

const releasePrefix = prompt('Which service to release? (tap or tab to select service)', {autocomplete: search => availableVersionNamePrefixes.filter(prefix => prefix.includes(search))});

const lastTagForPrefix = getTagsList()
  .find(currentTag => currentTag?.match(gitTagFormat) && currentTag.startsWith(releasePrefix));

if (lastTagForPrefix) {
  console.info(`ℹ️ Last tag for ${colorize(releasePrefix, colorKeys.yellow)} was ${colorize(lastTagForPrefix, colorKeys.yellow)}`);
}
else {
  console.info(colorize(`ℹ️ No previous tags found for ${releasePrefix}`, colorKeys.yellow));
}

console.info('ℹ️ Those version types are available for release:');
console.info(colorize(availableVersionTypes.join('\n'), colorKeys.blue));

const releaseType = prompt('Which version type to upgrade? (tap or tab to select service)', {autocomplete: search => availableVersionTypes.filter(prefix => prefix.includes(search))});

const nextReleaseVersionName = getNextVersion(releasePrefix, releaseType, lastTagForPrefix);

if (!['', 'y'].includes(prompt(colorize(`ℹ️ The version \`${colorize(nextReleaseVersionName, colorKeys.yellow)}\` will be created and published, are you sure? (y)`, colorKeys.blue)))) {
  process.exit(0);
}

// tag && push
rebaseLocaleBranch(releaseBranch);
createAndPushTag(nextReleaseVersionName);

// display releaselog
console.log(execSync(`node ${SHELL_ALIAS_DIR}/scripts/supermood/release-log.mjs`).toString());

process.exit(0);
