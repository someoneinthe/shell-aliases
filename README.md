# shell-aliases

node files to create shell aliases

[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=shell-aliases&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=shell-aliases)

## Usage

To put in your `.bashrc` or `.zshrc` file

### Add all shortcuts

```bash
SHELL_ALIAS_DIR=$PATH_TO_REPOSITORY
source $SHELL_ALIAS_DIR/.source.sh
```

### Add only pecific shortcuts

```bash
SHELL_ALIAS_DIR=$PATH_TO_REPOSITORY
alias myAliasName='node $SHELL_ALIAS_DIR/scripts/my-file-to-run.mjs'
```
