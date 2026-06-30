# Accessibility Review Guide

Use this guide when reviewing Kikita UI primitives, playground pages, and docs examples. Automated checks are useful, but they are only a smoke test. A clean DOM accessibility scan does not prove that keyboard users, screen-reader users, switch users, magnifier users, or users of forced-colors mode can use the component comfortably.

Record review status in `docs/state-coverage.md` when the result changes public component status. Local, in-progress review notes can live in `.local-notes/PROGRESS.md`.

## Review Levels

- DOM smoke: checks for broken ARIA references, duplicate ids, unnamed visible controls, invalid roles, console errors, and obvious focus traps.
- Keyboard review: uses only the keyboard to reach, operate, dismiss, and leave each interactive state.
- Assistive-technology review: uses at least one real screen reader or platform accessibility tool to verify names, roles, states, descriptions, announcements, focus order, and interaction feedback.
- Browser and visual review: checks responsive layout, contrast, forced colors, reduced motion, overlays, and zoom behavior.

Do not mark a primitive as fully accessibility-audited when only DOM smoke or unit tests have run. DOM smoke can catch broken wiring; it cannot confirm what assistive technology announces or whether the interaction model feels usable.

## Baseline Setup

- Review the real playground route, not only an isolated test fixture.
- Test light and dark themes when the primitive has visual state.
- Test desktop and narrow mobile widths when layout changes.
- Use browser zoom at 200% for components with dense content or overlays.
- Keep devtools console open and record component-related errors.
- Prefer native browser behavior as the baseline for native elements before adding ARIA expectations.

## Keyboard-Only Checks

- Tab order reaches every visible interactive control once in a logical order.
- Shift+Tab returns through the same path without losing focus.
- Focus indicators are visible, meet contrast expectations where practical, and do not cause layout shift.
- Enter and Space activate controls according to native or documented behavior.
- Escape closes dismissable overlays, menus, popovers, dialogs, and transient surfaces.
- Arrow keys, Home, End, PageUp, and PageDown work only where the component pattern expects them.
- Disabled controls cannot be activated and do not create confusing keyboard stops unless the pattern requires focusable disabled items.
- Focus is restored to the invoking control after closing modal or anchored overlays.
- Keyboard users can leave composite widgets without being trapped.

## Screen-Reader And AT Checks

Use the platform tools available to the reviewer, such as NVDA or JAWS on Windows, VoiceOver on macOS or iOS, TalkBack on Android, or browser accessibility inspectors. At least one real screen reader is required before calling AT review complete.

- Every visible interactive control has the expected name, role, state, and value.
- Descriptions from hints, errors, tooltips, and help text are announced only when they are relevant.
- Required, invalid, checked, selected, expanded, pressed, current, busy, loading, and disabled states are announced when applicable.
- Focus order and browse/virtual cursor order match the visual and logical reading order.
- State changes are announced without forcing focus changes unless the pattern requires focus movement.
- Non-modal overlays do not hide unrelated page content from the screen reader.
- Modal dialogs expose only the intended modal interaction area while open.
- Trigger and surface relationships are meaningful, and ARIA references point only to existing DOM nodes.
- Generated ids remain stable for the component lifecycle and do not duplicate when multiple examples render on one page.

## Overlay Checks

Review dropdown, select, tooltip, popover, dialog, toast, and any future overlay primitive with both keyboard and AT.

- Opening the surface announces the trigger state or moves focus according to the pattern.
- Closing the surface removes stale `aria-controls`, `aria-describedby`, and `aria-labelledby` references.
- Escape, click outside, route change, and trigger reactivation follow the documented behavior.
- Focus is contained only for modal surfaces.
- Focus returns to the correct trigger after dismissing modal or command-style overlays.
- The surface remains usable at narrow widths and high zoom without horizontal page overflow.
- Overlay placement changes do not reorder the accessible reading flow in a confusing way.
- The overlay does not cover the trigger or active control in a way that prevents continued keyboard use.

## Forms And Field Checks

- Form-associated controls are demonstrated inside `kui-field` unless the primitive is intentionally standalone.
- `[formField]` remains on the native/control element inside `kui-field`.
- Labels, hints, errors, and required markers come from `kui-field` by default.
- The accessible name comes from the visible label when possible.
- Hint and error ids are referenced only while the elements exist.
- Required and invalid states are exposed to AT.
- First error announcement is understandable after blur, submit, or validation state changes.
- Disabled and readonly states are visually distinct and semantically accurate.
- Signal Forms examples preserve native semantics and do not require custom ARIA to compensate for broken binding.

## Live Region And Toast Checks

- Toast severity maps to polite or assertive live-region behavior according to urgency.
- Repeated toasts are announced in a useful order without duplicate noise.
- Auto-dismiss does not remove important information before keyboard or screen-reader users can act.
- Toast actions are keyboard reachable and have clear accessible names.
- Progress indicators that represent time or work expose useful status without excessive announcements.
- Loading and completion states are announced once when the state matters to the user.

## Table Checks

- Use native table markup for tabular data.
- Header cells identify rows or columns correctly.
- Sort controls are native buttons inside headers where possible.
- Sort state is announced through `aria-sort` or an equivalent documented pattern.
- Selection checkboxes have row-specific accessible names.
- Sticky headers or columns do not duplicate focusable controls or confuse reading order.
- Horizontal scrolling is local to the table region when the page cannot fit all columns.
- Caption, summary text, or surrounding heading provides enough context for the data.

## Tooltip, Popover, Dropdown, And Dialog Checks

- Tooltip content is supplemental, not required to complete the task.
- Tooltip `aria-describedby` exists only while the tooltip DOM exists.
- Popovers that contain interactive content use a pattern appropriate for their role and do not masquerade as tooltips.
- Dropdown and select triggers announce expanded/collapsed state.
- Menu-like controls use roving focus or active-descendant behavior only when the chosen pattern requires it.
- Dialogs have an accessible name and an escape path unless explicitly non-dismissable.
- Non-dismissable dialogs document why escape is blocked and still provide a reachable action path.

## Motion, Contrast, And Forced Colors

- Respect `prefers-reduced-motion` for nonessential animation.
- Essential motion has a non-motion cue.
- Focus, selected, invalid, disabled, and loading states remain distinguishable without relying on color alone.
- Text and icon contrast meet WCAG AA where practical for the component size.
- Forced-colors or high-contrast mode preserves visible boundaries, focus, and state indicators.
- Semi-transparent overlays and shadows are not the only way to communicate depth or modality.

## Per-Component Review Template

Copy this template into `docs/state-coverage.md` or local notes when recording a review. Keep the summary short, factual, and tied to the exact route and date.

```md
### <Primitive> Accessibility Review

- Date:
- Reviewer:
- Playground route:
- Browser and OS:
- Assistive technology:
- Viewports:
- Themes:
- DOM smoke:
- Keyboard-only:
- Screen-reader or AT:
- Overlay behavior:
- Forms and field wiring:
- Live region behavior:
- Table behavior:
- Reduced motion:
- High contrast or forced colors:
- Color contrast:
- Result:
- Follow-up:
```

Use `N/A` only when the primitive genuinely does not have that behavior. For example, table behavior is `N/A` for `kuiButton`, while overlay behavior is required for dropdown, select, tooltip, popover, dialog, and toast.

## State Coverage Note Format

When updating `docs/state-coverage.md`, prefer precise notes:

```md
- Assistive-technology review for `<primitive>` was run on <date> with <AT/browser/OS>. Covered keyboard navigation, names/roles/states, focus return, and <primitive-specific behavior>. Remaining gap: <gap or "none known">.
```

If only automated or DOM review has run, say that directly:

```md
- DOM accessibility smoke has run for `<primitive>`, but real assistive-technology review is still pending.
```
