# Refactoring Policy

- Refactor in small, behavior-preserving slices. Each slice should be independently
  reviewable and independently revertable.
- Never mix a structural refactor with an unrelated feature change or visual tweak in the
  same commit.
- Before a refactor, confirm the current behavior (read the tests, or the code, closely
  enough to state it in one sentence). After, confirm nothing changed except what you
  intended.
- If a refactor touches a shared component/utility or a core singleton, update its doc
  entry in `.agents/shared/README.md` / `.agents/core/README.md` in the same change — see
  `.agents/documentation.md`.
- Prefer extracting over rewriting: pull duplicated logic into a helper rather than
  reimplementing both call sites.

## Review Checklist

- [ ] Each commit is either "refactor" or "behavior change", never both.
- [ ] Tests (if configured) still pass after the refactor with no changes to their
      assertions, unless the refactor intentionally changed behavior.
- [ ] Docs updated if a shared piece moved or changed shape.
