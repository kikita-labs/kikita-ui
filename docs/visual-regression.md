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

Baselines are Linux captures (`*-linux.png`) taken in the official Playwright Docker image. CI
compares against them in the same image. Screenshots differ between operating systems because of
fonts and anti-aliasing (the theme uses a system font stack), so a baseline taken on a developer
machine would never match CI. Docker must be running locally.

Run the visual baseline check for the Playground:

```bash
pnpm.cmd test:visual
```

Update baselines only after reviewing the rendered change and confirming it is intentional:

```bash
pnpm.cmd test:visual:update
```

Both commands run `scripts/visual-docker.mjs`. It starts the image that matches the installed
`@playwright/test` version, installs dependencies into named Docker volumes (the host
`node_modules` and `dist` are not touched), builds the app and runs the `visual` project. The CI
`visual` job pins the same image tag, and `scripts/visual-docker.spec.mjs` fails when the tag drifts
from the installed version. After a Playwright upgrade, update the tag in
`.github/workflows/ci.yml` and regenerate every baseline.

Running the `visual` project directly with `playwright test` on Windows or macOS finds no
baselines and fails. Use the commands above.

Playwright serves the built Playground through its SSR server
(`dist/kikita-ui-playground/server/server.mjs`). The run fails before any test when that build is
missing or older than its sources (`tools/assert-playground-build.mjs`), so a stale build cannot
produce a baseline; the Docker commands build the app inside the container first.

Screenshots are stable because of pinned inputs, not retries: the visual project sets
`prefers-reduced-motion: reduce`, and every suite pins the `en-US` locale and the `UTC` timezone.
The behavior project deliberately keeps production motion, so reduced
motion in a screenshot never hides a broken animation. Dates that a screenshot shows must be frozen
with `page.clock.setFixedTime`. Default icons load from a CDN, so a baseline that shows icons needs
either network access or a stubbed request as in the Toast, Field and Icon Button specs; the error
harness tolerates the failed request but a screenshot would show the missing icon.

Add a scoped screenshot only for a state that is part of the visual contract, and review the actual
and diff images before accepting a baseline. Plan 11 added no baselines.

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
