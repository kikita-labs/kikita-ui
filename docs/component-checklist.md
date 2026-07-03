# Component Delivery Checklist

Use this checklist before marking any public Kikita UI primitive as done. Do not mark a checklist item complete unless it is actually implemented and verified. If something is intentionally deferred, write the exact reason in `docs/component-roadmap.md` and `docs/state-coverage.md`.

## 1. Design Input

- Matching Claude Design spec exists in `.local-notes/claude-design/design system/`.
- Component states, variants, sizes, density behavior, light/dark treatment, motion, and mobile behavior are clear from the spec.
- No visual decisions are invented when the spec is missing or ambiguous.
- Token names and component API names follow the existing `kui` naming style.

## 2. API And Semantics

- Native semantics are used when possible, for example `button[kuiButton]`, `input[kuiInput]`, `table[kuiTable]`, `input[type=range][kuiSlider]`.
- A component is used only when native/directive semantics are not enough.
- Public selectors use the `kui` prefix.
- Public APIs use signals, signal inputs, models, and queries.
- Marker directives stay boolean-like. Visual variants use an explicit
  `appearance` input, not a marker directive value.
- Public classes, directives, components, providers, services, types, and tokens have JSDoc.
- Public API is exported from the local `index.ts`, `projects/ui/src/lib/components/index.ts`, and `projects/ui/src/public-api.ts` when applicable.
- New services use Angular 22 `@Service` unless official Angular docs or a specific DI pattern require otherwise.
- New components do not add `ChangeDetectionStrategy.OnPush`; Angular 22 default change detection is assumed.

## 3. Forms

- Form-associated controls are demonstrated inside `kui-field`.
- `[formField]` stays on the native/control element inside `kui-field`, not on `kui-field`.
- `kui-field` handles label, hint, error, required marker, ids, and `aria-describedby` wiring.
- Docs and playground do not hand-roll field-level label/hint/error wiring around input-like controls.
- Native input-like primitives support Signal Forms first.
- Custom controls implement the correct Angular Signal Forms control contract when native binding is not enough.
- Required and error behavior is covered by tests where the primitive participates in forms.

## 4. Styling And Tokens

- Runtime styles live in `projects/ui/src/styles/<primitive>.css`.
- The primitive style file is imported from `projects/ui/src/styles/kikita-ui.css`.
- Styles use `@layer kui.components` or the correct Kikita-owned layer.
- Styles consume `--kui-*` CSS variables for design values.
- No hardcoded design colors are introduced when a token exists or should exist.
- CSS supports light and dark themes.
- CSS supports compact, regular, and comfortable density when the primitive has density-sensitive dimensions.
- Focus, hover, active, disabled, invalid, selected, loading, open, and closed states are styled where relevant.
- Reduced motion is respected for animation-heavy primitives.
- Playground SCSS is only demo layout/state simulation, not component styling.

## 5. Accessibility

- Follow the review workflow in `docs/accessibility.md` before calling assistive-technology review complete.
- Visible focus is present and does not cause layout shift.
- Every visible interactive element has an accessible name.
- Native HTML semantics are preferred before ARIA.
- ARIA references are never stale:
  - `aria-controls` points to an existing element only while that element exists.
  - `aria-describedby` points only to existing hint/error/tooltip elements.
  - `aria-labelledby` points only to existing labels.
- Generated ids are stable for the component lifecycle and do not duplicate on the page.
- Disabled state uses native `disabled` when possible; otherwise `aria-disabled` and keyboard behavior are handled intentionally.
- Keyboard behavior is implemented and tested for composites:
  - Escape closes overlays where applicable.
  - Arrow keys/Home/End work where the pattern requires them.
  - Enter/Space activate non-native triggers when needed.
  - Focus is restored after modal/popover/dialog close when appropriate.
- Overlay components use Angular CDK or Angular Aria for complex behavior.
- Overlay positioning is verified for start/center/end alignment. With Angular/CDK 22, do not rely on `overlayX: 'center'` or `overlayX: 'end'` when the pane size is unknown before first paint; use a stable `overlayX: 'start'` connection plus inner transform compensation instead.
- Dialog-like surfaces have an accessible name and an escape path unless explicitly non-dismissable.
- Toast/live-region behavior uses polite/assertive semantics according to severity.
- A DOM accessibility smoke check has no broken ARIA refs, duplicate ids, unnamed visible controls, or console errors.
- Real assistive-technology review is documented separately when completed.

## 6. Playground

- Playground route exists under `projects/playground/src/app/pages/<primitive>/`.
- Page demonstrates real component states, not fake one-off styling.
- Page demonstrates sizes and variants.
- Page demonstrates light and dark behavior.
- Page demonstrates density or mobile behavior where relevant.
- Page includes disabled, focus, hover, active, invalid/error, selected/open/closed states where relevant.
- Page has no obvious text overflow, clipped controls, unexpected horizontal page overflow, or broken layout at narrow mobile widths.
- Page uses existing shared playground primitives such as `app-panel` when appropriate.

## 7. Documentation

- `docs/<primitive>.md` exists.
- Docs include import, usage, API inputs/outputs, examples, accessibility notes, keyboard behavior, form usage where relevant, and style import notes.
- `docs/state-coverage.md` lists the route and covered states.
- `docs/component-roadmap.md` reflects true status and known gaps.
- If the primitive is intentionally documented inside another page, that is stated in both roadmap and state coverage.
- All tracked docs are English-only and contain no Cyrillic or mojibake.

## 8. Tests

- Unit tests cover public host attributes and inputs.
- Unit tests cover important accessibility wiring.
- Unit tests cover keyboard behavior for composites.
- Unit tests cover form integration for form-associated controls.
- Unit tests cover disabled/readonly behavior when relevant.
- Overlay tests verify open/close state and ARIA references while DOM exists.
- Any skipped/deferred test is documented with the reason.

## 9. Browser Review

- Browser smoke is run in the playground for the primitive route.
- Visual baseline capture follows `docs/visual-regression.md` for affected routes, viewports, themes, console checks, overflow checks, and local screenshot storage.
- Desktop viewport is checked.
- Narrow mobile viewport is checked.
- Console has no component-related errors.
- Page-level horizontal overflow is absent unless the component intentionally scrolls inside its own container.
- Overlay placement/open/close behavior is checked for overlay primitives.
- Tooltip/popover/dropdown/dialog surfaces do not leave stale DOM or stale ARIA references after close.
- Screenshots or notes are recorded when visual differences need follow-up.

## 10. Verification Commands

Run these before marking the primitive done:

```bash
pnpm audit:static
pnpm format:check
pnpm test
pnpm build
pnpm build:playground
```

If a command cannot run because of the local sandbox or environment, record the exact reason and rerun outside the sandbox when possible.

## 11. Final Status

Before finishing, answer these:

- Is the component exported publicly?
- Is the style available through `@kikita-labs/ui/styles`?
- Does the docs page exist?
- Does the playground route exist?
- Does state coverage match reality?
- Are known gaps documented?
- Did tests and builds pass?
- Did browser/a11y smoke pass?
- Is anything intentionally deferred?
