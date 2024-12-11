import {spawn} from 'node:child_process';
import {colorize, colorKeys} from './shell-colors.mjs';

/**
 * @description Copy message to clipboard
 *
 * @param {string} text - text to copy
 */
export const copyToClipboard = text => {
  let child;

  try {
    // for Mac users only.
    child = spawn('pbcopy');
  }
  catch {
    try {
      // for linux users only.
      child = spawn('xclip');
    }
    catch {
      try {
        // for Windows users only.
        child = spawn('clip');
      }
      catch {
        console.info(colorize('⚠️  Could not copy to clipboard, please copy your data manually', colorKeys.yellow));
        return false;
      }
    }
  }

  child.stdin.write(text);
  child.stdin.end();

  return true;
};
