import {execSync} from 'node:child_process';
import {copyToClipboard} from '../helpers/clipboard.mjs';
import {getTagsList, gitTagFormat} from '../helpers/git.mjs';
import {getCleanArguments} from '../helpers/process.mjs';
import {colorize, colorKeys} from '../helpers/shell-colors.mjs';

/**
 * @description Generate a release log between different tags.
 *
 * @example: releaselog // generate release log between the 2 last tags
 * @example: releaselog from=backoffice-1.0.1 // generate release log between the given tag and the last tag
 * @example: releaselog from=backoffice-1.0.1 to=backoffice-2.0.0  // generate release log between the given tags
 */

/**
 * @description Get tags to compare from args or from git tags list
 *
 * @returns {{from: string, to: string}}
 */
const getTagsToCompare = () => {
  const {from, to} = getCleanArguments();

  // from & to are url provided
  if (!!from && !!to) {
    console.info(colorize('ℹ️  You provided a tag range, we will use it to generate the changelog', colorKeys.yellow));
    return {from, to};
  }
  // we need to search within tags list to get last 2 tags
  else {
    console.info(colorize('ℹ️  You didn\'t provide a tag range, we will use the last 2 tags to generate the changelog', colorKeys.yellow));
    // get last 20 tags (more than we need to be sure to exclude test tags)
    const lastTagsList = getTagsList().filter(currentTag => currentTag?.match(gitTagFormat));

    const [toTags, fromTags] = lastTagsList.slice(0, 2);

    return {from: from ?? fromTags, to: to ?? toTags};
  }
};

/**
 * @description Get commits list from git log between two tags
 *
 * @param {string} from - tag to get commits from
 * @param {string} to - tag to get commits to
 * @returns {string[]} - commit list
 */
const getCommitsList = ({from, to}) => execSync(`git log --pretty=format:"%s @%an" ${from}..${to}`).toString()
  .split('\n')
  .filter(Boolean);

/**
 * @description Get commit prefix from commit prefix to display an emoji
 *
 * @param {string} commitPrefix - commit prefix
 * @returns {string} - slack emoji
 */
const getCommitPrefix = commitPrefix => {
  const tagPrefixes = {
    build: ':building_construction:',
    ci: ':traffic_light:',
    docs: ':orange_book:',
    feat: ':awyeah:',
    fix: ':helmet_with_white_cross:',
    lokalise: ':earth_americas:',
    perf: ':rocket:',
    refactor: ':hammer_and_wrench:',
    style: ':put_litter_in_its_place:',
    test: ':female-scientist:',
  };
  return tagPrefixes[commitPrefix] || '';
};

/**
 * @description Order & format commits list to display them in slack
 *
 * @param commitsList
 * @returns {string[]}
 */
const formatCommits = commitsList => {
  const categorisedTags = {
    /* eslint-disable sort-keys-shorthand/sort-keys-shorthand */
    feat: [],
    fix: [],
    docs: [],
    perf: [],
    test: [],
    refactor: [],
    build: [],
    ci: [],
    style: [],
    lokalise: [],
    /* eslint-enable */
  };

  // order commits by category
  commitsList.forEach(currentTag => {
    const regex = /^\w+/g;
    const [commitPrefix] = currentTag.match(regex);
    const cleanCommitPrefix = commitPrefix.toLowerCase();
    const cleanLokaliseOnCurrentTag = cleanCommitPrefix === 'lokalise'
      ? currentTag.replace(' @Robin Nicollet', '')
      : currentTag;
    const cleanCurrentTag = cleanLokaliseOnCurrentTag.replace(/\(#(\d+)\)/, '[(#$1)](https://github.com/Supermood/main-app/pull/$1)');
    const currentTagFormatted = `> ${getCommitPrefix(cleanCommitPrefix)} ${cleanCurrentTag}`;

    categorisedTags[cleanCommitPrefix]
      ? categorisedTags[cleanCommitPrefix].push(currentTagFormatted)
      : categorisedTags[cleanCommitPrefix] = [currentTagFormatted];
  });

  // remove empty categories, and join each category with a line break
  return Object.values(categorisedTags)
    .filter(value => !!value.length)
    .map(valueList => valueList.join('\n'));
};

/**
 * @description Get full changelog message
 *
 * @param {string[]} formattedCommitsList - commits list to display
 * @param {string} version - version to display
 * @returns {string} - full changelog message
 */
const getFullLog = (formattedCommitsList, version) => `*Supermood is now released!* :tada:
Here is the changelog:
${formattedCommitsList.join('\n')}

  1. :unlock: Login: https://app.preprod.supermood.com/auth/sso/saml20?sk=supermood-fr&redirectTo=%2Fapp%2F%23%2Fmooder-office%2Fadmin-dev%2Fcache
  2. :arrows_clockwise: Refresh the cache of app engine URLs
  3. :rocket: Test (backoffice): https://v${version.replace('.', '-')}-dot-backoffice-dot-preprod-supermood.appspot.com/app/domain-switch
  4. :rocket: Test (API): https://app.preprod.supermood.com/app/?apiVersion=${version.replace('.', '-')}#/

  Please react with :heavy_check_mark: or :x: after testing your own commits.
`;

const {from, to} = getTagsToCompare();
const tagsList = getCommitsList({from, to});
const formattedTags = formatCommits(tagsList);
const fullMessage = getFullLog(formattedTags, to);

if (copyToClipboard(fullMessage)) {
  console.info(colorize('✅ Changelog copied to clipboard', colorKeys.green));
}

console.log(fullMessage);

process.exit(0);
