#!/usr/bin/env sh

# git relative
alias cleanLocalBranches="node $SHELL_ALIAS_DIR/dist/clean-local-branches.js"
alias gitCleanTags="node $SHELL_ALIAS_DIR/dist/git-tags-clean.js"
alias gswitch="node $SHELL_ALIAS_DIR/dist/git-switch-branch.js"

# personal
alias gs="git status"
alias gskip="git rebase --skip"

# egerie specific
alias updateRepositories="node $SHELL_ALIAS_DIR/dist/egerie/update-repositories.js"
alias cleanRepositories="node $SHELL_ALIAS_DIR/dist/egerie/clean-repositories.js"
