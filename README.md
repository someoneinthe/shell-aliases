# shell-aliases

node files to be run in shell to help you for some commands

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=shell-aliases&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=shell-aliases)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=shell-aliases&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=shell-aliases)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=shell-aliases&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=shell-aliases)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=shell-aliases&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=shell-aliases)

[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=shell-aliases&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=shell-aliases)

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=shell-aliases&metric=bugs)](https://sonarcloud.io/summary/new_code?id=shell-aliases)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=shell-aliases&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=shell-aliases)

## Prerequisites

For these scripts to work, you need to have the following installed on your machine:

- `node`: lts or most recent
- `yarn` (or `npm` should work too): any version
- `git`: 2.23.0 or most recent

## Installation

You will have to install dependencies in the root directory of this repository, then compile the files.

```bash
yarn install --production
```

A 'postinstall' script is automatically run to compile the typescript files. You can also build manually with:

```bash
yarn build
````

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
alias myAliasName="node $SHELL_ALIAS_DIR/dist/my-file-to-run.js"
```

### Execute without alias

```bash
node $PATH_TO_THIS_REPOSITORY/dist/my-file-to-run.js
```
