#!/usr/bin/env sh

# git relative
alias cleanLocalBranches="npx tsx $SHELL_ALIAS_DIR/scripts/clean-local-branches.ts"
alias gitCleanTags="npx tsx $SHELL_ALIAS_DIR/scripts/git-tags-clean.ts"
alias gswitch="npx tsx $SHELL_ALIAS_DIR/scripts/git-switch-branch.ts"

# personal
alias gs="git status"
alias gskip="git rebase --skip"

# supermood specific
alias generateRelease="npx tsx $SHELL_ALIAS_DIR/scripts/supermood/create-release.ts"
alias releaseLog="npx tsx $SHELL_ALIAS_DIR/scripts/supermood/release-log.ts"
