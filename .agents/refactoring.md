# Refactoring Protocol

Refactor in behavior-preserving slices. The goal is a sequence of reviewable
states where the library remains buildable and the next step is obvious.

## Before Editing

1. Read `AGENTS.md` and required `.agents` docs.
2. Run `git status --short` and preserve unrelated changes.
3. Identify public API, docs, tests, and playground surfaces touched by the
   refactor.
4. Run or inspect the current relevant baseline.

## Slice Shape

Each non-trivial slice should define:

- current behavior that must remain;
- target boundary or cleanup;
- files expected to change;
- tests added or updated;
- verification commands;
- docs or roadmap updates;
- rollback point.

## Separation

Keep these separate unless inseparable:

- public API changes and visual redesign;
- docs restructuring and component behavior;
- SSR safety fixes and theming changes;
- broad file moves and feature work;
- test infrastructure and component implementation.

## Review Checklist

- Public API is smaller or clearer.
- JSDoc coverage remains complete.
- Typing got stricter or stayed equally strict.
- Template-facing members are protected and internals are private.
- Stable references are readonly.
- Direct DOM/global access did not increase.
- SSR/hydration risk is tested or documented.
- Docs, roadmap, state coverage, and changelog are current.
