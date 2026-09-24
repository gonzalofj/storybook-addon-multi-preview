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

Versions follow [SemVer](https://semver.org) and are fully automated via [Release Please](https://github.com/googleapis/release-please) — never bump `package.json` or cut release tags by hand.

**How it works:**

1. Every PR merged into `dev` with a Conventional Commit title (see [Commit style](#commit-style)) feeds the Release Please workflow, which runs on every push to `dev`.
2. The workflow maintains a rolling release PR — **"chore: release X.Y.Z"** — that bumps `package.json` and generates `CHANGELOG.md` from those commits.
3. Merging the release PR tags `vX.Y.Z`, creates the GitHub release, and triggers the **Publish to npm** workflow (requires the `NPM_TOKEN` repository secret).
4. Finish by opening and merging a `dev` → `main` promotion PR — `main` and the docs site then reflect the released state.

**Version impact of each PR title:**

| PR title | Version bump |
| --- | --- |
| `feat: …` | minor (1.2.3 → 1.3.0) |
| `fix: …` | patch (1.2.3 → 1.2.4) |
| `feat!: …` / `BREAKING CHANGE:` footer | major (1.2.3 → 2.0.0) |
| `docs:`, `chore:`, `refactor:`, `test:`, `ci:` | none |

Release Please targets `dev` rather than `main` on purpose: version bumps travel with the regular promotion PRs instead of colliding with them, and every step works through pull requests, so branch protection stays fully enforced.

### Beta channel

Releases currently publish to the **beta** channel, not production: the release PR proposes prerelease versions (`1.1.0-beta.N`) and npm serves them only via `npm install storybook-addon-multi-preview@beta` — the `latest` dist-tag is untouched.

To go stable, merge a commit whose message contains a `Release-As: 1.1.0` footer — the next release PR will propose exactly that stable version. (Alternatively, a PR that removes `"versioning": "prerelease"` from `release-please-config.json` returns to normal semver proposals; `prerelease: true` only flags the GitHub release object and does not affect version numbers.)
