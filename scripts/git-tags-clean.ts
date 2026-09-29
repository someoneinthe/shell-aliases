import prompts from 'prompts';
import {copyToClipboard} from './helpers/clipboard';
import {execGit, getTagsList, gitSemVersionTagFormat} from './helpers/git';
import {colorize, ColorKeys} from './helpers/shell-colors';

const [, , dryMode] = process.argv;
const isDryMode = ['--dry', 'true', true].includes(dryMode);

if (!isDryMode) {
  console.log(colorize('❗️ You didn\'t provide dry mode argument. Tags will be removed', ColorKeys.RED));
}

const {willSwitch} = await prompts({
  initial: isDryMode,
  message: isDryMode
    ? colorize('⚠️  You are running the script in dry mode. This won\'t erase any tag, just list the tags to be removed', ColorKeys.YELLOW)
    : 'Are you sure you want to proceed?',
  name: 'willSwitch',
  type: 'confirm',
}) as {willSwitch: boolean};

if (!willSwitch) {
  process.exit(0);
}

const orderTags = (tagsList: string[]) => {
  const tagsByType: {otherTags: string[]; versionTags: string[]} = {
    otherTags: [],
    versionTags: [],
  };

  for (const currentTag of tagsList) {
    const isVersionTag = gitSemVersionTagFormat.test(currentTag);

    if (!isVersionTag) {
      console.log(currentTag);
    }

    tagsByType[isVersionTag ? 'versionTags' : 'otherTags'].push(currentTag);
  }

  return tagsByType;
};

const removeTagsWithBatch = (tagsList: string[], batchSize = 10) => {
  // proceed deletion only if necessary
  if (!tagsList.length) {
    console.info(colorize('❗️ Nothing to clean', ColorKeys.GREEN));
    process.exit(0);
  }

  // tagsList is split in batches
  const tagsToRemoveBatches: string[][] = [];
  for (let index = 0; index < tagsList.length; index += batchSize) {
    tagsToRemoveBatches.push(tagsList.slice(index, index + batchSize));
  }

  // proceed deletion
  tagsToRemoveBatches.forEach((batch, index) => {
    console.info(`Removing batch ${index + 1} of ${tagsToRemoveBatches.length}...`);

    // Remote deletion
    execGit({options: ['push', 'origin'], values: batch.map(tagName => `:refs/tags/${tagName}`)});

    // Local deletion
    execGit({options: ['tag', '-d'], values: batch});
  });

  console.info(colorize(`✅  Clean finished, removed ${tagsList.length} tags in ${tagsToRemoveBatches.length} batches of ${batchSize}`, ColorKeys.GREEN));
};

const orderedTags = orderTags(getTagsList());

if (isDryMode) {
  console.info(colorize(`ℹ️  ${orderedTags.otherTags.length} tags to be removed`, ColorKeys.YELLOW));

  if (orderedTags.otherTags.length && copyToClipboard(orderedTags.otherTags.join('\n'))) {
    console.info(colorize('✅ Tags list copied to clipboard', ColorKeys.GREEN));
  }
}
else {
  console.warn('ℹ️  Clean tags');

  removeTagsWithBatch(orderedTags.otherTags, 50);
}

process.exit(0);
