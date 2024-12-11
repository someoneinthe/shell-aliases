import {execSync} from 'node:child_process';
import prompts from 'prompts';
import {copyToClipboard} from './helpers/clipboard.mjs';
import {getTagsList, gitTagFormat} from './helpers/git.mjs';
import {colorize, colorKeys} from './helpers/shell-colors.mjs';

const [, , dryMode] = process.argv;
const isDryMode = ['--dry', 'true', true].includes(dryMode);

if (isDryMode) {
  const {willContinue} = await prompts({
    initial: true,
    message: colorize('⚠️  You are running the script in dry mode. This won\'t erase any tag, just list the tags to be removed', colorKeys.yellow),
    name: 'willSwitch',
    type: 'confirm',
  });

  if (!willContinue) {
    process.exit(0);
  }
}
else {
  console.log(colorize('❗️ You didn\'t provide dry mode argument. Tags will be removed', colorKeys.red));

  const {willContinue} = await prompts({
    initial: false,
    message: 'Are you sure you want to proceed?',
    name: 'willSwitch',
    type: 'confirm',
  });

  if (!willContinue) {
    process.exit(0);
  }
}

const orderTags = tagsList => tagsList.reduce((accumulator, currentTag) => {
  const isVersionTag = currentTag.match(gitTagFormat);

  if (!isVersionTag) {
    console.log(currentTag);
  }
  isVersionTag ? accumulator.versionTags.push(currentTag) : accumulator.otherTags.push(currentTag);

  return accumulator;
}, {
  otherTags: [],
  versionTags: [],
});

const removeTagsWithBatch = (tagsList, batchSize = 10) => {
  // proceed deletion only if necessary
  if (tagsList.length) {
    const tagsToRemoveBatches = [];
    let currentBatchTagsLists = [];

    // tagsList is split in batches
    tagsList.forEach((tagName, index) => {
      // push current tags into batch
      currentBatchTagsLists.push(tagName);

      // batch size limit: start a new batch
      if ((index + 1) % batchSize === 0) {
        // push currentBatch
        tagsToRemoveBatches.push(currentBatchTagsLists);

        // reset currentBatch
        currentBatchTagsLists = [];
      }
    });

    // push last incomplete batch
    currentBatchTagsLists.length && tagsToRemoveBatches.push(currentBatchTagsLists);

    // proceed deletion
    tagsToRemoveBatches.forEach((batch, index) => {
      console.info(`Removing batch ${index + 1} of ${tagsToRemoveBatches.length}...`);

      // Remote deletion
      execSync(`git push origin :refs/tags/${batch.join(' :refs/tags/')}`);

      // Local deletion
      execSync(`git tag -d ${batch.join(' ')}`);
    });

    console.info(colorize(`✅  Clean finished, removed ${tagsList.length} tags in ${tagsToRemoveBatches.length} batches of ${batchSize}`, colorKeys.green));
  }
  else {
    console.info(colorize('❗️ Nothing to clean', colorKeys.green));
    process.exit(0);
  }
};

const orderedTags = orderTags(getTagsList());

if (isDryMode) {
  console.info(colorize(`ℹ️  ${orderedTags.otherTags.length} tags to be removed`, colorKeys.yellow));

  if (copyToClipboard(orderedTags.otherTags.join('\n'))) {
    console.info(colorize('✅ Tags list copied to clipboard', colorKeys.green));
  }
}
else {
  console.warn('ℹ️  Clean tags');

  removeTagsWithBatch(orderedTags.otherTags, 50);
}

process.exit(0);
