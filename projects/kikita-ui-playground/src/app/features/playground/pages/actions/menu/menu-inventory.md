# Menu Page Contract Inventory

## Audit status

The complete API audit for this page was performed retrospectively during this
remediation, after the first page implementation existed. It cross-checks
`docs/menu.md`, the exported component/directives and public types, component and
separator unit specs, the shipped Menu CSS and floating-panel utility, the page
templates, the route SSR/responsive spec, the focused visual spec, and both
locale catalogues.

Audit references: `projects/kikita-ui-playground/.agents/component-page-authoring.md`;
`docs/menu.md`; `docs/separator.md`; `projects/ui/src/lib/components/menu/index.ts`;
`projects/ui/src/lib/components/menu/kui-menu.component.ts` and its sibling
directives/types/spec; `projects/ui/src/lib/components/separator/index.ts` and
its directive/types/spec; `projects/ui/src/lib/utils/kui-floating-panel.util.ts`;
`projects/ui/src/lib/utils/kui-input-transform.util.ts`;
`projects/ui/src/lib/components/menu/kui-menu.css`; `projects/ui/src/lib/theme/create-kui-theme.ts`;
the page-private components in this folder; `projects/kikita-ui-playground/e2e/menu-playground.visual.spec.ts`;
`projects/kikita-ui-playground/e2e/component-pages.spec.ts`; and the EN/RU menu
catalogues.

## Public contract map

| Primitive and public input | Type and default/resolution                                                                                                                                                              | Example or omission                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `KuiMenu.ariaLabel`        | `string`; defaults to `'Actions'`.                                                                                                                                                       | The minimal example leaves it unset and asserts the source default. Content, placement, and spacing examples supply translated accessible names; the 320px capture reuses the minimal example so it preserves the default.                                                                                                                                                                                                                                                     |
| `KuiMenu.placement`        | `KuiMenuPlacement` (`'top' \| 'bottom' \| 'left' \| 'right'`); defaults to `'bottom'`.                                                                                                   | The minimal and spacing examples leave it unset. The placement catalogue shows all four values with both `menuAlign` values. Focused screenshots include the trigger and panel, and geometry assertions check the requested side. A separate constrained-height scenario scrolls the bottom-start trigger near the viewport edge and verifies the real overlay flips above it and remains in bounds.                                                                           |
| `KuiMenu.menuAlign`        | `KuiMenuAlign` (`'start' \| 'end'`); defaults to `'start'`. For top/bottom it aligns horizontally; for left/right it aligns vertically.                                                  | The minimal example uses the default; placement examples show both alignments on each side, and the spacing examples assert start/end alignment against the trigger.                                                                                                                                                                                                                                                                                                           |
| `KuiMenu.offset`           | `number`; defaults to `4`. The input transform converts numeric attributes and falls back to `4` for invalid or non-finite values; finite negative values are accepted by the transform. | The minimal example exercises the default. The spacing example shows and measures `0` and `12`. Invalid and negative values are omitted because they are input-boundary cases rather than recommended menu spacing; transform behavior is source-audited.                                                                                                                                                                                                                      |
| `KuiMenu.minWidth`         | `string \| null`; defaults to `null`. `null` leaves the theme minimum in effect; a provided CSS width is passed to the CDK overlay configuration.                                        | The minimal example uses the default; the spacing example sets `220px`, asserts actual panel width, and captures it beside its trigger. Other CSS widths are omitted because the input accepts arbitrary CSS lengths and do not add another distinct state. The content trigger moves to the inline end below 32rem so its end-aligned 220px panel fits the 320px viewport.                                                                                                    |
| `KuiMenuFor.kuiMenuFor`    | `KuiMenu \| undefined`; defaults to `undefined`. No output.                                                                                                                              | All page triggers bind a menu instance. An unbound trigger is omitted because opening is a no-op and there is no panel; the directive still exposes `aria-haspopup="menu"` and `aria-expanded="false"` on that host, so its semantic attributes are not visually represented here. The examples use native buttons; a custom non-button host is omitted because the button supplies native focus and Enter/Space behavior without consumer-authored ARIA or keyboard handling. |
| `KuiMenuItem.appearance`   | `KuiMenuItemAppearance` (`'neutral' \| 'destructive'`); defaults to `'neutral'`. No output.                                                                                              | Content menu shows the neutral default and destructive item.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `KuiMenuItem.disabled`     | `boolean`; defaults to `false` and uses Angular `booleanAttribute`. No output.                                                                                                           | Content menu shows a disabled native button and a disabled anchor. The visual spec verifies `aria-disabled`; for the anchor, it invokes the native DOM `.click()` programmatically and checks the handler prevents navigation and menu close. This is a defensive handler check, not user pointer/keyboard activation: source CSS sets `pointer-events: none` and the directive sets `tabindex="-1"` for menu items.                                                           |
| `KuiMenuHeader`            | No inputs or outputs.                                                                                                                                                                    | Content menu shows a translated group heading with `role="presentation"`.                                                                                                                                                                                                                                                                                                                                                                                                      |
| `KuiSeparator.appearance`  | `KuiSeparatorAppearance` (`'subtle' \| 'default' \| 'strong'`); defaults to `'default'`. No output.                                                                                      | The content menu uses the default emphasis. Other appearances are omitted because Menu documents a structural divider and the generic Separator contract owns appearance variants.                                                                                                                                                                                                                                                                                             |
| `KuiSeparator.orientation` | `KuiSeparatorOrientation` (`'horizontal' \| 'vertical'`); defaults to `'horizontal'`. No output.                                                                                         | The content menu uses a horizontal divider between action groups. Vertical orientation is omitted because a vertical rule is not a meaningful separator inside the Menu's vertical action list; the generic Separator contract owns that composition.                                                                                                                                                                                                                          |
| `KuiSeparator.spacing`     | `KuiSeparatorSpacing` (`'none' \| 'xs' \| 'sm' \| 'md' \| 'lg'`); defaults to `'sm'`. No output.                                                                                         | The content menu uses the documented compact `xs` spacing. Other values are omitted because spacing variants belong to the generic Separator catalogue and do not change Menu behavior.                                                                                                                                                                                                                                                                                        |

The component also exposes public state and methods: writable signal `isOpen`
(initially `false`), stable `panelId`, `openFor(anchor, focus = 'none')`,
`toggleFor(anchor)`, and `close(restoreFocus = true)`. These are not component
inputs or outputs. The page covers their observable behavior through trigger
ARIA, opening, action close, Escape close, and focus restoration; direct
programmatic calls are omitted because `[kuiMenuFor]` is the documented
consumer-facing trigger. `panelId` is checked through `aria-controls` while the
panel is open. The item directive also exposes `focus()`, `isFocusable()`, and
`getElement()` for component integration; direct method calls are omitted because
they are not page-level consumer interactions.

Menu uses ordinary Angular content projection; there are no named component
projection inputs. The examples cover native button items, anchor items, icon
and shortcut spans, a presentation-only header, and a native `hr[kuiSeparator]`.
Icon/shortcut spans are consumer content, not Menu inputs. None of these
primitives declares an output event; action handlers and link destinations
belong to the consumer.

The public Menu barrel (`projects/ui/src/lib/components/menu/index.ts`) exports
the component, trigger/header/item directives, and align/placement/item-
appearance types. The public Separator barrel
(`projects/ui/src/lib/components/separator/index.ts`) exports the directive and
appearance/orientation/spacing types. These are the types used in the map above.

## States, semantics, and behavior

| State or behavior                           | Page and verification mapping                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Closed/open state and trigger relationships | The default trigger starts with `aria-haspopup="menu"`, `aria-expanded="false"`, and no `aria-controls`; after opening, the spec checks `aria-expanded="true"` and that `aria-controls` matches the panel id.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Panel and item semantics                    | Open examples use a named `role="menu"`; action and link items use `role="menuitem"`; the header is presentation-only; separators remain native `hr` elements. Unit tests in `projects/ui/src/lib/components/menu/kui-menu.component.spec.ts` cover these semantics.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Pointer activation and close                | The default Edit action updates a live `role="status"` message and closes the menu. A real pointer click also asserts focus stays on the trigger. Hover and pressed screenshots follow real pointer interaction. A second trigger click toggles the panel closed, and clicking the page heading outside the panel dismisses it. Enabled anchor activation navigates to the in-page content example and closes the menu.                                                                                                                                                                                                                                                                    |
| Keyboard opening and movement               | The spec opens with ArrowDown and ArrowUp, native Enter and Space activation, checks first/last focus, moves among enabled items, verifies ArrowDown/ArrowUp wrap across the enabled list, skips disabled entries, and checks Home/End.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Escape and Tab                              | Escape closes and restores focus to the trigger. A real browser Tab flow opens from the content trigger, focuses the first enabled item, tabs out, asserts the menu closes, verifies focus is not on the trigger, and checks that the active element has a nonnegative tab index. The unit test separately covers the close method's `restoreFocus=false` option.                                                                                                                                                                                                                                                                                                                          |
| Disabled items                              | The page shows disabled button and anchor items. Browser assertions check disabled ARIA state and keyboard skip behavior. The disabled anchor navigation check is programmatic `HTMLAnchorElement.click()` (not user activation), and asserts its defensive handler prevents navigation or menu close.                                                                                                                                                                                                                                                                                                                                                                                     |
| Focus, hover, and active item styles        | Keyboard opening captures actual focused-item styling; hover/pressed captures use pointer state. `projects/ui/src/lib/components/menu/kui-menu.css` defines hover, active, focus-visible, disabled, and destructive styles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Placement, alignment, offset, and viewport  | The eight side/alignment cases assert trigger-panel geometry. A separate constrained-height case verifies that a requested bottom placement flips above its trigger and remains in the viewport. Start/end and 0/12 offset examples measure the panel against the trigger; both offsets use a 1px geometry tolerance so the default 4px gap cannot pass the zero-offset case. The custom `220px` minimum asserts the rendered panel width. The 320px open-menu test checks document overflow and that both trigger and panel fit. Closed-catalogue screenshots at 320px and 768px assert the placement/alignment grid column counts (1/1 and 2/3 respectively) and no horizontal overflow. |
| Dismissal and layout safety                 | Browser checks cover outside `mousedown`, trigger-toggle close, action close, Escape close, and Tab close. Anchor-offscreen dismissal, resize repositioning, and available-height clamping remain source behaviors in `kui-menu.component.ts` and `kui-floating-panel.util.ts`; the page does not synthesize these environmental states. The generic route spec also checks SSR/hydration and closed-page document width at 320, 768, and 1440px.                                                                                                                                                                                                                                          |
| Reduced motion and mobile target sizing     | A focused browser check sets `prefers-reduced-motion: reduce`, verifies the preference is active and the open menu's computed animation is `none`, then exercises Escape dismissal. Source `close()` calls `finishClose()` immediately when reduced motion is preferred, and the unit test verifies the panel is removed and focus is restored; there is no source-level lifecycle discrepancy here. The stylesheet declares a 44px item-height token under `.kui-menu--mobile`, but the menu template does not add that class and exposes no mobile-size input, so this page does not claim mobile menu items reach 44px. The 320px checks cover containment only.                        |

Nested submenus, checkbox/radio items, and a right-click context-menu helper are
explicitly deferred in `docs/menu.md`. Value selection is omitted because Menu
is an action menu, not a value picker. Trigger focus behavior differs by input:
pointer opening retains trigger focus, while keyboard opening focuses an enabled
item; the page covers both. For disabled anchors the source provides ARIA
disabled semantics and suppresses click default/propagation; it cannot use the
native `disabled` attribute supported by buttons.

## Documentation discrepancies

- `docs/menu.md` omits the public `placement` input from the `kui-menu` API
  table. The source default is `'bottom'` and the page demonstrates all four
  values.
- The `menuAlign` API row calls alignment horizontal, while the source defines
  horizontal alignment for top/bottom and vertical alignment for left/right.
  The public type JSDoc at
  `projects/ui/src/lib/components/menu/kui-menu-align.type.ts:1` repeats the
  overly broad horizontal-only wording; the placement examples exercise both
  axes.
- The docs describe trigger ARIA effects but do not list the
  `kuiMenuFor: KuiMenu | undefined` input/default.
- The trigger directive applies `aria-haspopup="menu"` and
  `aria-expanded="false"` even when `kuiMenuFor` is undefined
  (`projects/ui/src/lib/components/menu/kui-menu-for.directive.ts`); the
  resulting unbound-trigger semantic combination is inherited source behavior
  and intentionally not presented as a supported page example.
- The docs omit component state/methods (`isOpen`, `panelId`, `openFor`,
  `toggleFor`, `close`) and the public item helper methods. These are recorded
  here for audit completeness; updating library docs is outside this page's
  scope.

## Locale, SSR, and review evidence

Page labels and accessible names are sourced from matching EN/RU keys under
`projects/kikita-ui-playground/public/i18n/menu/`. Structural key parity was
checked during this audit. The minimal menu deliberately leaves `ariaLabel`
unset to preserve the core component's English default `'Actions'`; other named
panels use localized labels. Native keyboard activation from the default button
focuses its first item, while ArrowUp from the trigger focuses the last item;
item navigation wraps while skipping disabled entries. The focused spec's
keyboard-entry cases first round-trip the shell language and verify the
document's `lang` attribute changes in both directions. This is a test-local
client-interaction readiness barrier; it restores English before the Menu
assertions and does not alter the application hydration configuration. The shared
`projects/kikita-ui-playground/e2e/component-pages.spec.ts` includes the Menu
route in its SSR/hydration assertion and checks closed-page document width at
320px, 768px, and 1440px. The focused visual spec adds open-menu geometry at
desktop and 320px plus closed-catalogue grid and overflow evidence at 320px and
768px. The focused spec passed 28/28 twice with snapshot updates off after ten
parent-reviewed, source-justified baselines were updated; both no-update runs
passed without snapshot diffs. All 28 named captures are present. The obsolete
`menu-keyboard-open-page-win32.png` was removed after source search confirmed
neither the focused nor shared route spec references it. The page owner reviewed
the desktop, 320px, and 768px captures, and the parent independently reviewed
the changed snapshots. `node_modules/.bin/ng.cmd build kikita-ui-playground`
passed. The focused suite exercises the Menu route from the built SSR server and
verifies hydrated client interactions. The shared `component-pages.spec.ts`
route-level SSR/responsive checks remain parent-owned integration verification;
they were not run as part of this page-scoped gate. Shared route and SSR-registry
integration remains parent-owned.

## Self-review checklist

- [x] Read the component-page authoring requirements and audit the current docs,
      public types/inputs, implementation, unit specs, styles, floating-panel
      utility, page templates, visual spec, locales, and generic SSR/responsive
      route spec. This was a retrospective audit after initial implementation.
- [x] Map every public input/default, projection primitive, method/state surface,
      and output absence to an example or a reasoned omission above.
- [x] Check real ARIA/native semantics, pointer and keyboard interaction, and
      disabled button/anchor behavior without inventing component states.
- [x] Keep page-only layout rules tokenized and keep EN/RU catalogue structures
      in parity.
- [x] Use a paired wrapper for each trigger/menu instance so empty component
      hosts cannot occupy catalogue grid cells.
- [x] Add trigger-and-panel geometry captures, a 1px zero-offset assertion,
      viewport checks, and explicit 320px open-menu overflow evidence.
- [x] Add closed-catalogue 320px and 768px screenshots with breakpoint column
      and horizontal-overflow assertions.
- [x] Add browser coverage for pointer-focus retention, trigger-toggle close,
      outside-click dismissal, native Enter/Space activation, focus cycling,
      Tab focus handoff, reduced motion, and constrained-space placement flip.
- [x] The page owner ran the focused Menu spec twice after its final snapshot
      updates with update mode off (28/28 each time), built the Playground app,
      reconciled only the ten independently reviewed captures, inspected the
      desktop/mobile/tablet visuals with the parent, and removed the unreferenced
      stale baseline. The shared route-level SSR/responsive integration check is
      parent-owned and remains separate from this page gate.
