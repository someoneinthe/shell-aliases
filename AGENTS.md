# AGENTS.md

## Project overview

`shell-alias` is a collection of Node.js/TypeScript CLI scripts that act as shell aliases for git and release helpers. Source lives in `scripts/` and is compiled to `dist/` (gitignored — built on install), then wired up as shell aliases through `.source.sh`. This is an ESM project (`"type": "module"`) requiring Node >=24 (`.nvmrc` = v24). Several scripts perform destructive git/filesystem operations — read the Safety section before running anything.

## Commands

- `npm run build` — compiles TS to `dist/`: runs `tsc && ts-add-js-extension --dir=dist`.
- `npm run lint-code` — runs `eslint .` over the whole repo (`dist/` and `node_modules/` ignored). This is the single quality gate (type-aware lint); there is no separate type-check or format script.
- `postinstall` runs `npm run build` automatically; `prepare` runs `husky` to install git hooks. You do not invoke these by hand.
- There is **no test runner** — no `npm test`, no Vitest/Jest/MSW. Verify changes with `npm run lint-code` and `npm run build` only.

Use **npm**, never yarn. The committed lockfile is `package-lock.json`; `yarn.lock` has been removed as part of the npm migration — do not reintroduce it.

## Architecture

Entry-point scripts (run as aliases) and their alias mapping in `.source.sh` (`node $SHELL_ALIAS_DIR/dist/<file>.js`):

- `cleanLocalBranches` -> `dist/clean-local-branches.js` (from `scripts/clean-local-branches.ts`)
- `gitCleanTags` -> `dist/git-tags-clean.js` (`scripts/git-tags-clean.ts`)
- `gswitch` -> `dist/git-switch-branch.js` (`scripts/git-switch-branch.ts`)
- `updateRepositories` -> `dist/egerie/update-repositories.js` (`scripts/egerie/update-repositories.ts`)
- `supermoodGenerateRelease` -> `dist/supermood/create-release.js` and `supermoodReleaseLog` -> `dist/supermood/release-log.js` are **commented out** in `.source.sh`.
- `gs` and `gskip` are plain git aliases, not scripts.

Shared helpers live in `scripts/helpers/`:

- `git.ts` — `execSync` git wrappers: `fetchBranches` (`git fetch -p`), `getRemoteBranchesList`, `getUncommittedFilesList`, `switchLocalBranch`, `getLocalBranchesList`, `getCurrentBranchName`, `getTagsList`, `createAndPushTag`, `updateSubmodules`, `getSubmodulePaths`, `isWorktree` (reads the `.git` file target: `worktrees/` = linked worktree, `modules/` = submodule), `rebaseLocaleBranch` (auto-aborts on conflict); also exports `gitSemVersionTagFormat` regex.
- `clipboard.ts` — `copyToClipboard(text)` via `pbcopy`/`xclip`/`clip`.
- `shell-colors.ts` — `ColorKeys` enum + `colorize(message, color)` (ANSI escapes).
- `process.ts` — `getCleanArguments()` parses `process.argv` into a `Record<string, string>` of `key=value` tokens (for `from=`/`to=` style args).

Build pipeline: `tsconfig.json` sets `rootDir: scripts`, `outDir: dist`, so `dist/` is a flat mirror of `scripts/` (each `scripts/X.ts` -> `dist/X.js`, subdirs preserved). `tsc` compiles, then `ts-add-js-extension` rewrites relative imports to add explicit `.js` extensions (required for Node ESM). Entry scripts use top-level `await` (e.g. `prompts`), so they need an ESM-aware runner: `node` on the built `.js`, or `tsx scripts/<file>.ts` on source for dev.

## Code conventions

ESLint is extremely strict (`typescript-eslint` `strictTypeChecked` + `@stylistic` + `unicorn` + `perfectionist`, type-aware via `projectService`). Concrete rules:

- 2-space indent, LF line endings, final newline, no trailing whitespace.
- Single quotes always; escape apostrophes (`'Can\'t ...'`) or use template literals. `prefer-template` forbids `+` string concatenation.
- Semicolons always required.
- `object-curly-spacing: never` — write `{a, b}` and `import {execSync}` with NO space inside braces (space after comma, none inside braces).
- Trailing commas required on multiline arrays/objects/params (`always-multiline`), forbidden on single-line.
- `arrow-parens: as-needed` (`line => line.trim()`); `arrow-body-style: as-needed`.
- Stroustrup brace style: `catch`/`else` go on their **own line**, not cuddled after the closing brace.
- Imports sorted by perfectionist (natural-asc, case-insensitive, no blank lines between groups); Node builtins MUST use the `node:` prefix; named imports also sorted. Relative imports are **extensionless** in source.
- CommonJS is banned (`unicorn/prefer-module`); use `import`/`export` only.
- Naming: camelCase functions/vars/consts; exported helpers are arrow consts with explicit return types (`: void`, `: string[]`); enums are PascalCase with UPPER_CASE members.
- `perfectionist/sort-objects` is OFF, but `sort-keys-shorthand` is ON (asc, natural, shorthand-first, minKeys 2) — object literals with 2+ keys must be alphabetized with shorthand props first. Enums, interfaces, and object types are perfectionist-sorted.
- `process.exit()` and top-level await are allowed (`n/no-process-exit`, `unicorn/no-process-exit`, `n/shebang` all off).

Canonical house style (adapted from `scripts/helpers/git.ts`):

```ts
import {execSync} from 'node:child_process';
import {colorize, ColorKeys} from './shell-colors';

export const switchLocalBranch = (branchToSwitch: string): void => {
  try {
    execSync(`git switch ${branchToSwitch}`);
  }
  catch {
    throw new Error(`Can't switch to branch ${branchToSwitch}`);
  }
};
```

## TypeScript/tooling gotchas

- `moduleResolution: bundler` is **deliberate**. Source relative imports are extensionless (`./shell-colors`); `ts-add-js-extension` appends `.js` post-compile (e.g. `dist/helpers/git.js` reads `./shell-colors.js`). Do NOT add `.js` in source and do NOT switch to `nodenext` — both break the build pipeline.
- Never hand-edit `dist/` — it is gitignored and regenerated by the build (auto-run on `npm install` via `postinstall`). Always `npm run build` after changing `scripts/`.
- `rootDir: scripts` + `outDir: dist` give a flat `dist/` mirror; `strict: true`, `esnext` module/target, `esModuleInterop`, `skipLibCheck`. No `include` field.

## Safety

Most entry scripts mutate git/fs state. Do NOT run these casually:

- **`clean-local-branches.js` (cleanLocalBranches) — DESTRUCTIVE.** Force-deletes (`git branch -d -f`) every local branch whose upstream is gone, in the current repo AND recursively in every submodule. No confirmation prompt, no args.
- **`git-tags-clean.js` (gitCleanTags) — DESTRUCTIVE (remote + local).** Deletes non-semver tags via `git push origin :refs/tags/...` and `git tag -d`. Always pass `--dry` (or `true`) first to only list/preview; the no-arg path prompts once (default No) then deletes.
- **`egerie/update-repositories.js` (updateRepositories) — mass mutation.** Reads `$WORKSPACE` via a non-null assertion (crashes if unset); fetches and rebases the current branch and updates submodules across EVERY git repo under `$WORKSPACE` and `$WORKSPACE/unified-dev-stack` (linked worktrees are skipped).
- **`supermood/create-release.js` — VERY DESTRUCTIVE / publishing.** Creates and pushes a release tag (`git tag && git push origin`) — irreversible. Intentionally commented out in `.source.sh`.
- `git-switch-branch.js` (gswitch) — side-effecting but low-risk: fetches and `git switch`, no deletion. Requires a branch-name substring arg.
- `supermood/release-log.js` — read-only (Slack changelog via `git log`), though `getTagsList`/`getRemoteBranchesList` silently run `git fetch -p`.

Use `tsx scripts/<file>.ts` for dev only, and with the same caution — it executes the real git/fs side effects.

## Before you commit

Run `npm run lint-code` and ensure 0 errors. The `.husky/pre-commit` hook runs it on every commit, so any `scripts/*.ts` change will be linted (expect import-sort, key-sort, and stylistic failures if you deviate from the rules above).
