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

## Release process (automated)

1. Merge feature PRs into `dev` with Conventional Commit titles (see above).
2. The **Release Please** workflow maintains a release PR — "chore: release X.Y.Z" — that bumps `package.json` and updates `CHANGELOG.md` from the merged commits.
3. Merging that release PR tags `vX.Y.Z` and creates the GitHub release automatically, which runs the **Publish to npm** workflow (requires the `NPM_TOKEN` repository secret).
4. Promote by opening and merging a `dev` → `main` pull request — this updates the docs site and leaves `main` reflecting the released state.

Never bump versions or create release tags by hand.
