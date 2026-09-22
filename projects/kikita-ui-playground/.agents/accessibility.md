# Accessibility

- Prefer native HTML semantics before ARIA (`<button>` not `<div role="button">`).
- Text content uses the tag for what it is — headings (`h1`-`h6`), paragraphs (`p`), lists
  (`ul`/`ol`/`li`), labels/captions — never `div`/`span` as a default text container. If a
  UI library's typography primitive is in use, that's the equivalent — give it the correct
  semantic tag/role, don't default it either. See `code-style/ui-library-usage.md`.
- Use Angular CDK or Angular Aria primitives (focus trap, live announcer, focus origin,
  listbox/combobox/menu behaviors) for complex interactive widgets instead of hand-rolling
  keyboard/focus handling.
- A toast/notification that appears asynchronously (save success, background error, etc.)
  lives in a container with `aria-live="polite"` (or `"assertive"` only for something that
  needs immediate interruption, e.g. a destructive-action failure) so assistive tech
  announces it — content that only appears via `@if`/DOM insertion with no live region is
  silent to a screen reader. One shared live-region container, reused by every toast in the
  app, not one ad hoc per call site.
- Every interactive element is reachable and operable by keyboard alone.
- Touch targets are at least 44x44px on touch viewports.
- Don't claim a component is "fully accessible" without actually checking it — screen
  reader pass, keyboard-only pass, and color-contrast check (WCAG 2.2 AA, 4.5:1 for text).
- Responsive: components must work from a 320px viewport up through desktop, without
  horizontal scroll on the page body.

## Review Checklist

- [ ] Keyboard-only pass done on new interactive UI.
- [ ] Color contrast meets WCAG 2.2 AA.
- [ ] No horizontal scroll introduced at 320px width.
- [ ] Native semantics used before reaching for ARIA.
- [ ] Async toasts/notifications render inside a shared `aria-live` container, not a silent
      DOM insertion.
- [ ] Text content uses a semantic tag (or the UI library's typography primitive with the
      correct tag/role), not `div`/`span` by default.
