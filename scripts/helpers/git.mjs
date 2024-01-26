import {execSync} from "node:child_process";
import {colorize, colorKeys} from "./colors.mjs";

const fetchBranches = () => {
  try {
    execSync('git fetch -p').toString()
  } catch {
    console.log(colorize('❗️ Can\'t fetch remotes branches.', colorKeys.red));
    process.exit(1);
  }
}

export const getLocalBranches = () => {
  fetchBranches();

  try {
    return execSync('git branch -r').toString().trim()
  } catch {
    console.log(colorize('❗️ Can\'t fetch remotes branches.', colorKeys.red));
    process.exit(1);
  }
}

export const switchLocalBranch = branchToSwitch => {
  fetchBranches();

  try {
    return execSync(`git switch ${branchToSwitch}`);
  } catch {
    process.exit(1);
  }
}

export const getLocalRemovedBranches = () => {
  fetchBranches();

  try {
    return execSync('git branch -vv').toString().trim()
  } catch {
    console.log(colorize('❗️ Can\'t fetch remotes branches', colorKeys.red));
    process.exit(1);
  }
}

export const getCurrentBranchName = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  } catch {
    console.log(colorize('❗️ Can\'t get current branch.', colorKeys.red));

    process.exit(1);
  }
}

export const getTagsList = () => {
  fetchBranches();

  return execSync('git tag').toString().trim()
    .split('\n')
    .filter(Boolean);
}
