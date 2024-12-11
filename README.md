# shell-aliases

node files to be run in shell to help you for some commands

[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=shell-aliases&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=shell-aliases)

## Prerequisites

For these scripts to work, you need to have the following installed on your machine:
- `node`: any version
- `yarn` (or `npm` should work too): any version
- `git`: 2.23.0 or most recent

You will also have to install dependencies with `yarn install --production` or `npm install` in the root directory of this repository.

## Usage

To use these scripts, you have to put aliases in your `.bashrc` or `.zshrc` file.
It's not mandatory, but recommended to avoid to write the full command path each time.

### Add all shortcuts

```bash
SHELL_ALIAS_DIR=$PATH_TO_THIS_REPOSITORY
source $SHELL_ALIAS_DIR/.source.sh
```

### Add only selected shortcuts

```bash
SHELL_ALIAS_DIR=$PATH_TO_THIS_REPOSITORY
alias myAliasName="node $SHELL_ALIAS_DIR/scripts/my-file-to-run.mjs"
```
### Execute without alias

```bash
node $PATH_TO_THIS_REPOSITORY/scripts/my-file-to-run.mjs
```
