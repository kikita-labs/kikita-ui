# Typography Contract Inventory

Status: accepted by the parent (research gate passed); implemented and reconciled with the shipped page below.

Typography is a CSS-only primitive (`projects/ui/src/styles/typography.css`, layer `kui.base`) plus a
convenience attribute directive `KuiTextDirective` (`[kuiText]`). The directive only toggles the same
role and tone classes and mirrors the values into two data attributes. It adds no ARIA, no role, no
element replacement, and no interaction.

## Public API

| Export                                | Type, default, and resolution                                                                                                                                                                                               | Observed behavior                                                                                                                                                                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kuiText` `variant` input             | `KuiTextVariant`; `input<KuiTextVariant>('body')`. Eleven values: `display`, `heading-lg`, `heading-md`, `heading-sm`, `title`, `body-lg`, `body`, `body-sm`, `caption`, `overline`, `code`. No transform, no root default. | Host gets exactly one `kui-<variant>` class and `data-kui-text-variant="<variant>"`. Changing the input swaps the class.                                                                                                            |
| `kuiText` `tone` input                | `KuiTextTone`; `input<KuiTextTone>('default')`. Seven values: `default`, `muted`, `disabled`, `primary`, `success`, `warning`, `danger`.                                                                                    | Host gets exactly one `kui-text-<tone>` class and `data-kui-text-tone="<tone>"`. Because the default tone is applied explicitly, a bare `kuiText` always sets `color: var(--kui-color-text)` and does not inherit the parent color. |
| `KuiTextVariant`, `KuiTextTone` types | Public string-union types exported from `@kikita-labs/ui`.                                                                                                                                                                  | Compile-time only. An unsupported string is a type error; at runtime an unknown value would simply add no class (not exercised, not fabricated on the page).                                                                        |
| Plain CSS classes                     | `.kui-display`, `.kui-heading-lg/md/sm`, `.kui-title`, `.kui-body-lg`, `.kui-body`, `.kui-body-sm`, `.kui-caption`, `.kui-overline`, `.kui-code`; `.kui-text-default/muted/disabled/primary/success/warning/danger`.        | Documented CSS-only usage. Same computed styles as the directive equivalent.                                                                                                                                                        |
| Type-role tokens                      | Per role: `--kui-type-<role>-size`, `-line-height`, `-weight`. Sizes reuse `--kui-text-*-size`; weights use `--kui-font-weight-*`. Defined by `create-kui-theme.ts` (light and dark share them).                            | Consumers can override the triplet on any ancestor; the role classes read the token, so size and line height follow (component `file-upload.css` already overrides `--kui-type-caption-weight` locally).                            |

There are no outputs, models, providers, services, or injection tokens.

Resolved default token values (from `create-kui-theme.ts`, theme defaults):

| Role         | Size (token)  | Line height | Computed line height | Weight |
| ------------ | ------------- | ----------- | -------------------- | ------ |
| `display`    | 36px (`3xl`)  | 1.15        | 41.4px               | 700    |
| `heading-lg` | 28px (`2xl`)  | 1.2         | 33.6px               | 700    |
| `heading-md` | 22px (`xl`)   | 1.25        | 27.5px               | 600    |
| `heading-sm` | 18px (`lg`)   | 1.3         | 23.4px               | 600    |
| `title`      | 14px (`base`) | 1.4         | 19.6px               | 600    |
| `body-lg`    | 15px (`md`)   | 1.6         | 24px                 | 400    |
| `body`       | 14px (`base`) | 1.5         | 21px                 | 400    |
| `body-sm`    | 13px (`sm`)   | 1.5         | 19.5px               | 400    |
| `caption`    | 11px (`xs`)   | 1.5         | 16.5px               | 400    |
| `overline`   | 9px (`2xs`)   | 1.4         | 12.6px               | 600    |
| `code`       | 13px (`sm`)   | 1.5         | 19.5px               | 400    |

## Styling behavior (typography.css)

- Every role: `font-family: var(--kui-font-sans)`, `letter-spacing: 0`, `margin: 0`. All rules are in
  `:where()` (zero specificity), so consumer rules always win without layers.
- `overline`: hard-coded `letter-spacing: 0.5px` and `text-transform: uppercase` (not token-driven).
- `code`: mono font (`--kui-font-mono`), `--kui-color-surface-elevated` background, `--kui-radius-xs`,
  hard-coded `padding: 1px 5px`. Its `color` comes from `--kui-color-text` and is overridden by a tone
  class because tone rules come later in the file at equal specificity.
- Tones only set `color`: `default` text, `muted` text-secondary, `disabled` text-disabled, and
  `primary/success/warning/danger` the `*-soft-text` tokens. Light and dark themes re-evaluate them.
- There is no truncation, `overflow-wrap`, `hyphens`, or `white-space` rule. Long text wraps at spaces;
  a long unbreakable token overflows its box. The docs assign truncation to the container.

## State applicability

Typography has no focus, hover, pressed, disabled, invalid, loading, selected, or lifecycle state. The
`disabled` tone is color only: it adds no `disabled`/`aria-disabled` and no interaction change. None of
these states is fabricated on the page.

## Source references

- Docs: `docs/typography.md`.
- Directive: `projects/ui/src/lib/components/typography/kui-text.directive.ts`, types
  `kui-text-variant.type.ts` and `kui-text-tone.type.ts`, barrel `index.ts`, unit spec
  `kui-text.directive.spec.ts` (two tests: classes plus data attributes for one variant/tone pair, and
  class swap on input change).
- Styles: `projects/ui/src/styles/typography.css`; tokens in `projects/ui/src/lib/theme/create-kui-theme.ts`
  (lines 313-349) and `create-kui-theme.spec.ts`.
- Legacy reference (scenarios only, not modified): `projects/playground/src/app/pages/typography`
  (type scale, role tokens, product UI examples, tones, dark/light scopes, wrapping and overflow).

## Discrepancies and gaps (not fixed, library is out of scope)

1. Docs say `KuiTextDirective` is "for native text elements", but the directive accepts any host and
   never checks the element. The docs' "Native elements" column is guidance, not enforced.
2. `data-kui-text-variant` and `data-kui-text-tone` are emitted and unit-tested but not documented in
   `docs/typography.md`. The page asserts them as observed behavior and records this gap.
3. Docs do not say that `kuiText` without `tone` explicitly applies the `default` tone class and
   therefore overrides inherited color. Verified from the directive host bindings; the page shows a
   `kuiText` inside a muted parent to make this visible (see plan).
4. `overline` letter-spacing (`0.5px`) and `code` padding (`1px 5px`) are literal values, not tokens,
   although the docs describe tokens only for size, line height, and weight.
5. Unit tests cover one variant/tone pair and one swap. No test covers the default `body`/`default`
   values, every variant/tone class, or computed CSS. The Playground spec supplies computed-style
   evidence for all eleven roles and seven tones.
6. `docs/state-coverage.md` lists Typography under the legacy route `/typography` and
   `docs/browser-test-coverage.md` still records "no page and no browser or axe evidence"; the parent
   updates both (rows below in the final report).

## Planned page and mapping

Route `/components/typography`, group `data-identity`, scope `typography`, h1 "Typography"
(`id="typography-playground-title"`). Each group below is a `role="group"` with a translated label
around one `app-playground-example-card`.

| Contract item                                        | Planned visible example or check                                                                                                                                                                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Minimal default (`variant` `body`, `tone` `default`) | Card "Default": `<p kuiText>` with no inputs. Test asserts `data-kui-text-variant="body"`, `data-kui-text-tone="default"`, computed 14px / 21px / 400.                                                                                                                   |
| All 11 `variant` values                              | Card "Type roles": 11 rows (role name label + sample). Heading roles use `h3` so the outline stays sequential under the card `h2`; `display` is also `h3` (see decision 1). Test asserts computed size, line height, weight, family, transform.                          |
| All 7 `tone` values                                  | Card "Tones": 7 rows of a body sample. Test asserts the computed color of each tone equals the resolved `--kui-color-*` token, differs from the default for the five non-default non-disabled tones, and is stable in dark and light.                                    |
| Tone combined with role                              | Card "Roles and tones": 7 tones x 5 representative roles (`heading-sm`, `body`, `caption`, `overline`, `code`). The other six roles are omitted: tone only sets `color`, and the role/tone rules are independent (test loops all combinations it renders).               |
| Documented semantic host elements                    | Card "Semantic hosts": `h3` heading-md, `h4` heading-sm, `h5` title, `p` body, `small` caption, `code` code, `span` body-sm, `label` body-sm. Test asserts roles (`heading` levels 3, 4, 5, `code`) and that the directive kept the element.                             |
| Directive vs CSS-only classes                        | Card "Directive and classes": the same three lines rendered with `kuiText` and with plain `kui-*` classes. Test asserts identical computed size, line height, weight, and color for each pair.                                                                           |
| Default tone overrides inherited color               | In the same card: `kuiText` inside a `kui-text-muted` parent next to a plain `kui-body` inside it. Test asserts the directive host is default color and the plain-class host inherits muted.                                                                             |
| Token behavior (size, line height, weight)           | Nonvisual: the role table above is asserted per role. Plus a test-side override: `page.evaluate` sets `--kui-type-body-size` and `--kui-type-body-line-height` on an example container, asserts computed size and line height follow, removes it. No page CSS invention. |
| Wrapping                                             | Card "Wrapping and overflow": long paragraph in a narrow container wraps (test: height greater than one line, no overflow of the container).                                                                                                                             |
| Truncation (consumer-owned)                          | Same card: a long unbreakable `code` token in a row whose page SCSS owns `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`, labelled as container-owned. Test asserts `scrollWidth > clientWidth` and the page has no overflow.                           |
| Product compositions (legacy scenarios)              | Card "Compositions": settings section, dialog copy, and table adjunct rows built from real semantic tags; status text pairs color with a visible word (does not depend on color alone).                                                                                  |
| Light and dark scoped tokens                         | Card "Theme scopes": two blocks with `data-kui-theme="light"` and `data-kui-theme="dark"` (same precedent as the Scrollbar page). Test asserts tone colors differ between scopes. The shell toggle covers the global theme in a separate test.                           |
| English and Russian                                  | All labels and samples come from the `typography` scope. Test switches to RU and asserts the h1, a group label, and the uppercase `overline` transform on Cyrillic text.                                                                                                 |
| 320px / 768px / desktop                              | No document-level horizontal overflow at each width; per-group screenshots at desktop and 320px.                                                                                                                                                                         |
| SSR                                                  | Server response (`request.get`) contains the h1 and role samples; hydrated page keeps the same nodes; no console errors.                                                                                                                                                 |

Omissions with reasons:

- Focus, hover, pressed, disabled, invalid, loading, selected: not applicable (see above).
- Full 11 x 7 role/tone product: tone is a color-only utility; five representative roles cover every
  distinct role treatment (heading weight, body, small size, uppercase, code chip).
- Unsupported values and runtime-invalid `variant`/`tone`: rejected by types; not fabricated.
- Provider or root-default overrides: Typography has no provider and no root default.
- Clocks, timers, animation: none; no `page.clock` needed.

## Accepted decisions and implementation notes

1. Heading elements are a deliberate page choice, not a library rule: the Type roles card renders
   every heading-styled role (including `display`) as `h3` so the outline stays h1 > h2 card > h3.
   The Semantic hosts card shows `h3`, `h4`, `h5` in sequential order. The library does not enforce
   host elements.
2. Token behavior is asserted with a test-side override of `--kui-type-body-size`,
   `--kui-type-body-line-height`, and `--kui-type-body-weight` on the example container; the page
   adds no override visuals.
3. The truncation demo uses page SCSS (`overflow: clip; text-overflow: ellipsis; white-space:
nowrap`) on a container-owned row and is labelled as container-owned. `overflow: clip` is used so the row never becomes a scroll container.

4. The Roles and tones matrix shows a visible tone label (muted caption) before each row; the row
   group itself carries the translated accessible name.
5. The label-only host from the plan was dropped: a `label` needs a control, which belongs to the
   Field page. The Semantic hosts card covers `h3`, `h4`, `h5`, `p`, `small`, `span`, and `code`.
6. Visual captures use tall viewports (1440x1600 and 320x2600) because the shell workspace owns
   scrolling and would otherwise clip tall groups.

Axe finding fixed in Plan 10.3: the page root `<main>` is a keyboard tab stop (`tabindex="0"`) with a visible focus ring, because the page scrolls inside the shell workspace and has no focusable content of its own. `/components/typography` reports no violations.

Library observations recorded, not fixed: discrepancies 2 (undocumented data attributes), 3 (`kuiText`
without `tone` overrides an inherited parent color; asserted in the Directive and CSS classes card),
and 4 (literal `letter-spacing` and `padding`).

## Files planned

Page (new): `projects/kikita-ui-playground/src/app/features/playground/pages/data-identity/typography/`
`typography.ts`, `typography.html`, `typography.scss`, `index.ts`, `typography-inventory.md`, plus
`components/` (only if a repeated role-row layout justifies it).

Locale (new): `projects/kikita-ui-playground/public/i18n/typography/en.json`, `ru.json`.

Spec (new): `projects/kikita-ui-playground/e2e/typography-playground.visual.spec.ts` and its
`-snapshots/` directory.

Shared registry single-line edits: `src/app/enums/playground-route.enum.ts` (`Typography = 'typography'`),
`.../component-sidebar/constants/component-groups.const.ts` (data-identity entry after Tree, keeping
alphabetical order), `pages/data-identity/data-identity.routes.ts` (route with
`provideTranslocoScope('typography')`), `pages/data-identity/index.ts` (no change expected),
`public/i18n/en.json` and `ru.json` (`playground.components.typography`).

Not touched: `docs/state-coverage.md`, rollout tracker, `component-pages.spec.ts`,
`ssr-hydration.spec.ts`, `accessibility.spec.ts`, `tests/e2e/**`, library, legacy playground.

## Self-review checklist

- [x] Every public input, type, class, and token is in the table with default and behavior.
- [x] Every state is either mapped to an example or omitted with a reason.
- [x] Parent review of this inventory (accepted before implementation).
- [x] Desktop and 320px screenshots were opened and reviewed for clipping, overlap, and density.
- [x] English and Russian catalogues contain matching key sets (checked by script).
