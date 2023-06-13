import {execSync} from 'node:child_process';
import {getTagsList} from "./helpers/git.mjs";
import {colorize, colorKeys} from "./helpers/colors.mjs";

console.warn('ℹ️  Clean tags');

// Check 1.1234.12a tag format
const gitTagFormat = /^\d\.\d{1,4}\.\d{1,2}\w?/i;

const orderTags = tagsList => tagsList.reduce((accumulator, currentTag) => {
  const isVersionTag = currentTag.match(gitTagFormat);

  if (!isVersionTag) console.log(currentTag)
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

    // tagsList is splitted in batches
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
      execSync(`git push origin :refs/tags/${batch.join(' :refs/tags/')}`);
    });

    console.info(colorize(`✅  Clean finished, removed ${tagsList.length} tags in ${tagsToRemoveBatches.length} batches of ${batchSize}`, colorKeys.green))
  } else {
    console.info(colorize('❗️ Nothing to clean', colorKeys.green));
    process.exit(0);
  }
};

const orderedTags = orderTags(getTagsList());
removeTagsWithBatch(orderedTags.otherTags, 50)
process.exit(0);
