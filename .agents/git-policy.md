# Git And Release Policy

## Commit Policy

- Never add `Co-authored-by`, `Generated-by`, AI attribution, or assistant
  attribution lines to commit messages.
- Never claim co-authorship for Claude, Codex, ChatGPT, or any other AI tool.
- Commit messages must be concise, English, and focused on the user-visible or
  technical change.
- Do not commit unless the user asks for a commit or the current task explicitly
  includes committing.
- Before committing, ensure `CHANGELOG.md` is updated when the change touches
  public API, behavior, or fixes a user-visible bug.

## Changelog

`CHANGELOG.md` at the repo root tracks notable changes to `@kikita-labs/ui`,
following Keep a Changelog.

When a change touches public API, behavior, or fixes a user-visible bug, add an
entry under `## [Unreleased]` in the same change:

- `### Added`
- `### Changed`
- `### Fixed`
- `### Removed`

When cutting a release, move `[Unreleased]` entries under a new
`## [x.y.z] - YYYY-MM-DD` heading, bump `projects/ui/package.json` version to
match, and add the comparison link at the bottom of the file.

Purely internal changes such as test refactors, playground-only tweaks, or docs
wording do not need a changelog entry.

## Package

Current package scope is `@kikita-labs/ui`.

If the GitHub organization later becomes `kikita`, rename the package to
`@kikita/ui` before public release.

Use Node 24.17.0+.

```bash
pnpm install
pnpm build
pnpm build:playground
pnpm format:check
```

Read `docs/release.md` before versioning or publishing.
