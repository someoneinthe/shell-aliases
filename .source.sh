#!/usr/bin/env sh

# git relative
alias cleanLocalBranches="node $SHELL_ALIAS_DIR/dist/clean-local-branches.js"
alias gitCleanTags="node $SHELL_ALIAS_DIR/dist/git-tags-clean.js"
alias gswitch="node $SHELL_ALIAS_DIR/dist/git-switch-branch.js"

# personal
alias gs="git status"
alias gskip="git rebase --skip"

# supermood specific
alias generateRelease="node $SHELL_ALIAS_DIR/dist/supermood/create-release.js"
alias releaseLog="node $SHELL_ALIAS_DIR/dist/supermood/release-log.js"
