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
- Record breaking docs/consumer follow-up in the sibling docs repo local note
  described by `.agents/git-policy.md`.

## Release Gate

Before publishing, run the full quality gate from
`.agents/testing-and-quality.md`, then follow `docs/release.md`.
