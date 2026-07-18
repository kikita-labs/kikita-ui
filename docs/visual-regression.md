# Visual Regression Workflow

Kikita UI uses Playwright screenshot baselines for representative playground routes. These
baselines are committed source artifacts for release confidence; ignored local screenshots remain
review/debug artifacts only.

## Routes To Capture

Capture these playground routes whenever a visual primitive changes, a shared token changes, or
the component delivery checklist asks for browser review:

- `/button`
- `/field`
- `/input`
- `/select`
- `/dropdown`
- `/popover`
- `/dialog`
- `/toast`
- `/accordion`
- `/progress`
- `/slider`
- `/number-input`

Run the full baseline suite before release-oriented work. For a narrow component change, run the
visual project and review any diffs that touch the changed primitive, shared token, overlay, or
form-field behavior.

## Viewports And Themes

The committed baseline suite captures representative route, viewport, and theme combinations:

- Desktop: `1440 x 1000`
- Narrow mobile: `390 x 844`
- Light theme
- Dark theme

The screenshots include the real playground route, not isolated markup or copied component HTML.
Keep committed baselines focused on stable states. Add focused interaction screenshots only when a
stable open/transient state is part of the public visual contract.

## Commands

Run the visual baseline check:

```bash
pnpm.cmd test:visual
```

Update baselines only after reviewing the rendered change and confirming it is intentional:

```bash
pnpm.cmd test:visual:update
```

Playwright serves the built playground through `tools/serve-playground-dist.mjs`; run
`pnpm.cmd build:playground` first when the playground output may be stale.

## Review Procedure

1. Run `pnpm.cmd test:visual`.
2. If screenshots differ, inspect the Playwright output images before updating snapshots.
3. If the difference is intentional, run `pnpm.cmd test:visual:update` and commit the updated
   snapshot PNGs with the source change.
4. If the difference is accidental, fix the implementation and rerun the visual test.
5. If the difference is uncertain, keep local artifacts in `output/visual-regression/`, document
   the uncertainty, and do not mark the change visually complete.
6. Watch the console while loading and interacting with affected routes. Treat component-related
   console errors, failed lazy-route loads, hydration issues, or uncaught promise rejections as
   blockers.
7. Check for page-level horizontal overflow at both viewports. The document should not scroll
   sideways unless the route intentionally demonstrates an internal scrolling region.

## Screenshot Storage

Committed Playwright baselines live beside the visual spec in the Playwright snapshot directory.
Do not move or rename them by hand.

Store exploratory local screenshots under an ignored artifact directory, for example:

```text
output/visual-regression/YYYY-MM-DD/<route>/<viewport>-<theme>.png
```

Recommended names:

```text
button/desktop-light.png
button/desktop-dark.png
button/mobile-light.png
button/mobile-dark.png
select/desktop-light-open.png
dialog/mobile-dark-open.png
```

`output/` and `__screenshots__/` are ignored by git. Keep raw screenshots, comparison notes, and
temporary browser artifacts there or in another ignored local directory.

## What To Commit

Commit:

- source changes that intentionally alter the UI
- Playwright baseline PNG updates for intentional visual changes
- docs updates that describe new states, known gaps, or review results
- tests that cover behavior affected by the visual change
- a short note in `docs/state-coverage.md` or `docs/component-roadmap.md` when a gap is discovered
  and not fixed in the same change

Do not commit:

- local screenshot PNGs outside the Playwright snapshot directory
- browser cache folders
- generated comparison outputs
- local review notes from `.local-notes/`
- changes to ignored artifact directories

## Handling Differences

When screenshots differ from the previous local baseline, decide before merging the work:

- If the difference is intentional, update the relevant component docs or roadmap note when the
  visual contract changed.
- If the difference is accidental, fix the implementation and recapture the affected routes.
- If the difference is uncertain, keep exploratory screenshots in `output/visual-regression/`, write
  a short English review note in the final handoff, and do not mark the component as visually
  complete.
- If a route cannot be captured because the playground, browser tooling, or sandbox blocks it,
  record the exact reason and the routes that still need review.

The source of truth remains the repository: tokens, theme generator, CSS variables, component APIs,
JSDoc, docs examples, tests, committed baselines, and the playground.
