# Agent Workflow

Follow this workflow for every non-trivial change. Do not skip steps because the
task looks small.

1. Read `AGENTS.md`.
2. Read this file.
3. Run `git status --short` and identify unrelated user changes. Do not revert
   or rewrite unrelated changes.
4. For Angular work, call `angularCliKikita.list_projects` first. Do not use the
   generic `angularCli` server for this repository.
5. Read `docs/component-checklist.md` before creating or changing any public
   primitive.
6. Read the relevant existing docs before editing code:
   - `docs/component-roadmap.md`
   - `docs/state-coverage.md`
   - `docs/accessibility.md` for semantics, keyboard, ARIA, or overlay changes
   - `docs/visual-regression.md` for visual or responsive changes
   - `docs/release.md` before versioning or publishing
   - `CHANGELOG.md` before public API, behavior, or user-visible fixes
7. For a new or visually changed component, read the matching Claude Design spec
   under `.local-notes/claude-design/design system/` before implementing. If the
   spec is missing or ambiguous, stop and report the gap instead of inventing a
   design.
8. Implement the smallest correct change that follows existing local patterns.
9. Update all required docs, tests, exports, styles, roadmap, state coverage, and
   changelog entries in the same change.
10. Run the verification commands listed in `docs/component-checklist.md`. If a
    command cannot run, record the exact reason in the final response and do not
    claim the gate passed.
11. Before committing, review `git diff --check`, `git diff --stat`, and the
    relevant changed files. Confirm no tracked file contains Cyrillic or
    mojibake.

If any checklist item is intentionally deferred, write the reason in
`docs/component-roadmap.md` and `docs/state-coverage.md`. Do not leave deferred
work only in chat.
