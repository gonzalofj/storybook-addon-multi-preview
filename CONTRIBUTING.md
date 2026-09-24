# Contributing to storybook-addon-multi-preview

Thanks for your interest in improving this addon — issues and pull requests are both very welcome.

## Dev setup

Prerequisites: [bun](https://bun.sh) >= 1.x and Node 22.

```bash
bun install
```

| Command             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `bun run build`     | Build `dist/` with tsup                    |
| `bun run typecheck` | Type-check with `tsc --noEmit`             |
| `bun run test`      | Run unit tests (vitest)                    |

`dist/` is gitignored. To try the addon in a Storybook app, rebuild `dist/` and restart that app's dev server — addon builds are not hot-reloaded.

## Branch model

These rules are binding for everyone, including the maintainer:

- **`main`** — releases only. Never commit directly; changes land exclusively via pull request from `dev`.
- **`dev`** — integration branch. Never commit directly; changes land exclusively via pull requests from feature branches or forks.
- Feature branches follow `feat/<topic>`, `fix/<topic>`, or `ci/<topic>` naming, branched off `dev`.

## Commit style

PR titles follow [Conventional Commits](https://www.conventionalcommits.org) — squash merges use the PR title as the commit message, and CI rejects non-conventional titles:

- `feat:` — new feature → bumps the **minor** version
- `fix:` — bug fix → bumps the **patch** version
- `docs:`, `chore:`, `refactor:`, `test:`, `ci:` — no release on their own
- `feat!:` / `fix!:` (or a `BREAKING CHANGE:` footer) → bumps the **major** version

## Opening issues

- **Bugs**: include your Storybook version, OS, a minimal reproduction (story + relevant `parameters`), and screenshots if visual.
- **Feature requests**: describe the problem you are trying to solve first, then the proposed solution.

## Submitting pull requests

1. Fork the repo or create a feature branch from `dev`.
2. Keep changes focused on one topic.
3. Make sure `bun run build`, `bun run typecheck`, and `bun run test` all pass — CI runs on every PR.
4. Open the PR **against `dev`**. PRs targeting `main` are reserved for release promotion by the maintainer.

## Versioning and releases

Releases are fully automated by [semantic-release](https://semantic-release.gitbook.io/semantic-release/) — never bump `package.json` or create release tags by hand. Versions follow [SemVer](https://semver.org) and are derived from Conventional Commit titles (see [Commit style](#commit-style)):

- **Merge to `dev`** containing `feat:`/`fix:` changes → a **beta** release is published immediately to the npm **`beta`** dist-tag (`1.0.0-beta.1`, `1.0.0-beta.2`, …). Merges touching only `docs:`/`ci:`/`chore:`/`refactor:`/`test:` publish nothing.
- **Merge `dev` → `main`** → the **stable** release is published to **`latest`** (`1.0.0`). Promotion is the release. Use a **merge commit** for the promotion (or title the squash `feat:`/`fix:`) — semantic-release reads the commit titles that land on `main`, and a `chore:`-titled squash would release nothing.
- `feat!:` / `BREAKING CHANGE:` footers bump the major version on the next release.

Release notes live in GitHub Releases (no `CHANGELOG.md` file is kept). Publishing requires the `NPM_TOKEN` secret — a granular access token allowed to bypass 2FA (classic Automation tokens also work but are deprecated by npm).

**Rotating the token** (granular tokens expire; current one is 90 days). Run locally while logged in to npm:

```bash
npm token create --name GH_CI --expires 90 \
  --packages-and-scopes-permission read-write \
  --orgs-permission no-access \
  --bypass-2fa \
  --packages storybook-addon-multi-preview
```

Copy the printed token, then update the repo's **`NPM_TOKEN`** secret (Settings → Secrets and variables → Actions). Sanity-check the value before saving:

```bash
npm whoami --userconfig=/dev/null --//registry.npmjs.org/:_authToken=npm_PASTED_TOKEN
```

This must print your npm username — the `--userconfig=/dev/null` flag ensures you are testing the token itself, not your local npm login.
