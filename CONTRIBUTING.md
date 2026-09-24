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
- Feature branches follow `feat/<topic>` or `fix/<topic>` naming, branched off `dev`.

## Commit style

Short imperative subject line (50–72 characters), optionally a body explaining *why* the change was needed. Match the existing history.

## Opening issues

- **Bugs**: include your Storybook version, OS, a minimal reproduction (story + relevant `parameters`), and screenshots if visual.
- **Feature requests**: describe the problem you are trying to solve first, then the proposed solution.

## Submitting pull requests

1. Fork the repo or create a feature branch from `dev`.
2. Keep changes focused on one topic.
3. Make sure `bun run build`, `bun run typecheck`, and `bun run test` all pass — CI runs on every PR.
4. Open the PR **against `dev`**. PRs targeting `main` are reserved for release promotion by the maintainer.

## Release process (maintainers)

1. Merge `dev` into `main` via pull request.
2. Tag the release commit on `main` as `vX.Y.Z` (matching the package.json version).
3. The **Publish to npm** workflow builds and publishes to npm automatically (requires the `NPM_TOKEN` repository secret).
