# Skeleton Contract Inventory

This inventory maps the released `[kuiSkeleton]` directive contract to the page examples. Skeleton
adds decorative placeholder styling to an existing host; the consumer owns the loading region and
the point when its content is replaced.

## Public inputs and outputs

| Input       | Public type                                                                             | Default   | Host behavior and page coverage                                                                                         |
| ----------- | --------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| `shape`     | `KuiSkeletonShape`: `text`, `heading`, `rect`, `circle`, `square`, `button`, or `badge` | `rect`    | Writes `data-kui-shape`. The default example omits the input; the matrix includes every shape with all animation modes. |
| `animation` | `KuiSkeletonAnimation`: `shimmer`, `pulse`, or `none`                                   | `shimmer` | Writes `data-kui-animation`. The default example omits the input; the matrix includes every mode with all shapes.       |

There are no outputs, models, methods, content slots, providers, or Skeleton-owned interaction and
lifecycle states. Both inputs are signal inputs. The directive has no coercion transforms; template
type checking constrains the values to the exported literal unions.

The source docs list the two input domains but omit their defaults. The directive source defines the
defaults above. Its focused unit test exercises explicit `circle` and `pulse` values, not the
defaults or the complete value domains.

## Shape and animation behavior

| Shape     | Library geometry                                                                          | Page geometry                                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `text`    | Line height from `--kui-skeleton-line-height` (theme default `12px`); extra-small radius. | The matrix cell bounds its inline size.                                                                                                    |
| `heading` | Height from `--kui-skeleton-heading-height` (theme default `22px`); extra-small radius.   | The matrix cell bounds its inline size.                                                                                                    |
| `rect`    | No block size is assigned by the primitive.                                               | A layout-only class gives each rectangle a visible block size; the default example also gives its default rectangle a visible inline size. |
| `circle`  | One-to-one aspect ratio and pill radius.                                                  | A layout-only class supplies an inline size.                                                                                               |
| `square`  | One-to-one aspect ratio and the base radius.                                              | A layout-only class supplies an inline size.                                                                                               |
| `button`  | Height follows `--kui-btn-height` (theme default `40px`) and uses the medium radius.      | Matrix cell bounds the inline size.                                                                                                        |
| `badge`   | Height follows `--kui-chip-height-sm` (theme default `22px`) and uses the pill radius.    | Matrix cell bounds the inline size.                                                                                                        |

All hosts are `inline-block`, use `inline-size: 100%`, and have `min-inline-size: 0`. The consumer
chooses dimensions through the host or its layout. The component does not expose width, height, or
gap inputs.

| Animation | Rendered behavior                                                                                           | Page coverage                                                |
| --------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `shimmer` | A highlight pseudo-element shimmers continuously at the `--kui-skeleton-duration` theme default (`1600ms`). | All seven shapes in the matrix; also the input-free default. |
| `pulse`   | The host opacity pulses at the same duration; the highlight pseudo-element is disabled.                     | All seven shapes in the matrix.                              |
| `none`    | The highlight pseudo-element has no background or animation; the host has no animation.                     | All seven shapes in the matrix.                              |

Under `prefers-reduced-motion: reduce`, the library disables both host and pseudo-element
animations for every mode. The E2E spec checks the computed animation on each layer.

## Semantics, accessibility, and lifecycle

- Every Skeleton host receives `class="kui-skeleton"`, `aria-hidden="true"`,
  `data-kui-shape`, and `data-kui-animation`. It does not expose a role, label, live region, or
  keyboard handler.
- Skeleton is decorative chrome. Do not make its host focusable or interactive. Its CSS also sets
  `pointer-events: none` and `user-select: none`.
- Put `aria-busy` on the containing region while that region's real content is loading. Skeleton
  does not set or announce that state. Use Loader when the consumer needs an announced loading
  status.
- The consumer-owned lifecycle example toggles placeholder insertion and `aria-busy` on a named
  region using native buttons. The page does not attribute that state or those actions to the
  Skeleton API.
- The consumer lifecycle controls use `kuiButton` `lg`, whose minimum block size is 44px. They are
  consumer controls, not part of Skeleton's contract; the mobile and tablet E2E checks verify both
  targets.
- No hover, focus, pressed, disabled, selected, validation, pause, or completion state belongs to
  this directive; none is simulated.

## Theme hooks and source limits

`@kikita-labs/ui/styles` supplies the runtime styles. The documented Skeleton hooks are
`--kui-color-skeleton-bg`, `--kui-color-skeleton-highlight`, `--kui-skeleton-bg`,
`--kui-skeleton-highlight`, `--kui-skeleton-radius`, `--kui-skeleton-radius-pill`,
`--kui-skeleton-duration`, `--kui-skeleton-line-height`, `--kui-skeleton-heading-height`, and
`--kui-skeleton-gap`. Light and dark semantic background/highlight defaults are provided by the
theme.

`--kui-skeleton-gap` is listed in the token docs and assigned a theme default, but
`skeleton.css` does not consume it. The page records that gap without adding a gap control or
claiming an effect for it. Other geometry tokens used by the stylesheet include shared radius,
button-height, and small-chip-height tokens.

## Page example map

| Example                    | Contract coverage                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default                    | One minimally configured `[kuiSkeleton]` host. Page layout supplies only enough geometry to show the default `rect` inside a compact example card; its E2E capture includes the card heading and border context while checks cover resolved `rect` / `shimmer` values, host class, and hidden semantics.                                                                 |
| Shape and animation matrix | Full 7 × 3 supported shape-animation matrix. Page classes control geometry only; labels and accessible group names come from the Skeleton scope. E2E checks each host's shape, animation, and `aria-hidden` attributes. At narrow mobile widths the rows compact into one shape column and three animation columns so all supported shapes fit in the viewport together. |
| Consumer-owned busy region | A named region starts with three placeholders and `aria-busy="true"`; native keyboard-operable controls replace them with localized content and set `aria-busy="false"`, then can restore loading. E2E checks both transitions, hidden placeholders, and focus remaining on the activated native button.                                                                 |
| Reduced motion             | Uses the real library `prefers-reduced-motion` rule. E2E explicitly sets `no-preference` before verifying active shimmer/pulse, then sets `reduce` and checks both host and pseudo-element animation names resolve to `none`.                                                                                                                                            |
| SSR and hydration          | The directive has no browser-only state; the route renders default placeholders and the consumer-owned busy region in server markup. E2E checks host semantics and confirms hydration produces no console or uncaught page errors.                                                                                                                                       |

The full matrix includes every supported pair, so no shape-animation combination is omitted. Light
and dark appearances come from the persistent shell; no page-level theme controls or token editor
are added. The page does not build extra consumer compositions for Avatar, Command Palette, Media
Viewer, or Chart because their own pages/components own those integrated states.

## Source audit

- [Skeleton source documentation](../../../../../../../../../docs/skeleton.md) establishes
  usage, input domains, region semantics, reduced-motion expectation, and the component token
  family.
- [Directive source](../../../../../../../../../projects/ui/src/lib/components/skeleton/kui-skeleton.directive.ts),
  [shape type](../../../../../../../../../projects/ui/src/lib/components/skeleton/kui-skeleton-shape.type.ts),
  and [animation type](../../../../../../../../../projects/ui/src/lib/components/skeleton/kui-skeleton-animation.type.ts)
  establish exports, defaults, host attributes, and literal input domains. The local
  [Skeleton barrel](../../../../../../../../../projects/ui/src/lib/components/skeleton/index.ts)
  is re-exported from the component barrel and package public API.
- [Skeleton styles](../../../../../../../../../projects/ui/src/lib/components/skeleton/kui-skeleton.css) establish
  geometry, modes, base pointer/selection behavior, and reduced motion. The stylesheet is imported
  through `projects/ui/src/styles/kikita-ui.css`.
- [Theme defaults](../../../../../../../../../projects/ui/src/lib/theme/create-kui-theme.ts)
  define Skeleton's component defaults and light/dark semantic colors. The component token list is
  in [tokens.md](../../../../../../../../../docs/tokens.md); the listed `--kui-skeleton-gap` is
  not read by the Skeleton stylesheet.
- The [direct unit spec](../../../../../../../../../projects/ui/src/lib/components/skeleton/kui-skeleton.directive.spec.ts)
  checks host class, explicit shape/animation attributes, and `aria-hidden`. Existing composition
  evidence includes Avatar's circle/square loading shape, Command Palette's `aria-busy` skeleton
  rows, Media Viewer's rectangular photo placeholder with load/reveal tests, and Bar Chart's
  square loading bars.
- The consumer lifecycle buttons use the documented [Button `lg` size](../../../../../../../../../projects/ui/src/lib/components/button/kui-button.css),
  which resolves to the 44px minimum block size required by the Playground's
  [accessibility guidance](../../../../../../../../../projects/kikita-ui-playground/.agents/accessibility.md).

## Self-review checklist

- [x] Both public inputs, types, defaults, and host attributes are recorded; there are no outputs or models.
- [x] Every supported shape and animation value and their complete combination matrix is represented.
- [x] Consumer geometry requirements and the unused `--kui-skeleton-gap` token are called out.
- [x] Decorative semantics, region-owned `aria-busy`, reduced motion, and non-interactive limits are covered.
- [x] Reduced-motion E2E explicitly sets both `no-preference` and `reduce`, independent of the browser host's default.
- [x] Consumer lifecycle buttons use the 44px `lg` control size; E2E checks both touch targets at 320px and 768px.
- [x] No unsupported Skeleton states or invented token behavior are included.
- [x] The default screenshot includes compact card context; the 320px matrix layout keeps all seven shape rows visible together.
- [x] Every page string and accessible name uses the Skeleton translation scope; EN/RU key parity is checked locally.
- [x] Parent added the direct `/components/skeleton` Feedback route, Transloco scope provider, and global SSR/responsive route entry.
- [x] After the shared reduced-motion CSS fix, production SSR build passed; the update and clean page browser suites passed 6/6, and all eight desktop/tablet/320px screenshots were regenerated as needed and visually inspected.
- [ ] No real screen-reader or external assistive-technology review was performed.
