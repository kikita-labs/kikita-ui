# Release And Publishing

Release and publishing facts live in `docs/release.md` and `CHANGELOG.md`.
Agents must read both before versioning, publishing, package metadata changes,
or docs-repo handoff work.

## Rules

- Do not publish from `projects/ui`; publish only from `dist/ui` or the
  repository publish script.
- Do not update the docs repo as if a new API is available until the exact
  package version is visible on npmjs.
- Add `CHANGELOG.md` entries for release-visible API, behavior, or bug fixes.
- Pure internal tooling, tests, and docs wording do not need changelog entries.

## Branch Model

Release branches are version-line branches named `release/<n>.x`; this policy
must not be tied to a specific major or minor version. The current release line
and its fixes are developed on `release/<n>.x`, the next release line is
developed on `release/<n+1>.x`, and `main` contains only the currently published
release line.

To publish the current release line:

`main` is protected: never push to it directly. Changes reach `main` only through a pull
request with green CI, merged with a merge commit.

Agents perform the pull request and merge with the GitHub CLI; the commands are in
`docs/release.md`. Agents do not change repository rulesets or settings: a repository admin
applies `.github/rulesets/*.json`.

1. On `release/<n>.x`, finalize the package version and move the matching changelog
   entries out of `[Unreleased]`.
2. Run the release gate after the release metadata change.
3. Open a pull request from `release/<n>.x` into `main` and merge it once CI is green.
4. Create and push the release tag from the resulting `main` commit.
5. Merge the updated `main` into the maintained release branches so the
   current and next release lines contain the release fixes and metadata.

Never tag a release branch directly. The publish workflow is triggered by a
`vX.Y.Z` tag and refuses to publish a commit that is not reachable from `main`.

## Release Gate

Before publishing, run the full quality gate from
`.agents/testing-and-quality.md`, then follow `docs/release.md`.
