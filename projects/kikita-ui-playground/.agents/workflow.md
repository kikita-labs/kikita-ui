# Workflow

Follow this sequence for any task in this repo.

1. Read `AGENTS.md`, then the `.agents/*.md` files it points to that are relevant to the
   task.
2. Run `git status` before touching anything — know what's already dirty before you start.
3. For any Angular CLI operation (generate, build config, migration), use the Angular MCP
   tools first instead of guessing flags or file layout by hand — `angular-mcp` is always
   installed, this is never optional. If a UI-library MCP is also installed, use it the
   same way for that library's APIs. See `.agents/mcp.md`.
4. Check `.agents/shared/README.md` and `.agents/core/README.md` before building a new
   component, utility, or singleton — reuse before you build.
5. Write the code following `.agents/code-style/` and `.agents/architecture/`.
6. Update the matching `.agents/` doc in the same change if you added, removed, or changed
   a shared component, utility, token, route, or convention. If the change was substantial
   (a milestone, not routine work), update `.agents/progress.md` too.
7. Run lint, format check, and tests (whichever are configured) before committing. See
   `.agents/testing-and-quality.md`.
8. Before committing, run `git diff --check` and scan the diff for Cyrillic or mojibake outside
   `public/i18n/` — source and documentation must be English only. This is also enforced mechanically: see
   `.agents/testing-and-quality.md`'s "Non-English Content Check".
9. Commit following `.agents/git-policy.md`.

## Review Checklist

- [ ] Read the relevant docs before writing code, not after.
- [ ] No shared/reusable code introduced without a doc entry.
- [ ] Lint, format, and tests (if configured) pass locally before commit.
- [ ] Commit message follows `.agents/git-policy.md`.
