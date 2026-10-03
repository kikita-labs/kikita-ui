# Breadcrumbs Page Inventory

This page demonstrates the currently shipped Breadcrumbs contract. The component docs, public directives and types, implementation test, root-size resolution, theme tokens, and runtime styles were reviewed before page implementation.

## Contract-to-example map

| Public surface or behavior                  | Contract and default                                                                                                                                      | Visible example or interaction                                                                                                                                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ol[kuiBreadcrumbs]`                        | Native ordered list; host receives `role="list"`, `kui-breadcrumbs`, and the resolved `data-kui-size`.                                                    | Every trail uses native `<nav>` and `<ol>` with the public directive; the minimal example asserts the role and default size.                                                                                              |
| `size` input / `KuiBreadcrumbsSize`         | `sm \| md \| lg`; local input wins, then supported root `defaults.size`, then `md`. The Playground shell currently provides no root size default.         | The minimal example omits `size`; the size catalogue renders `sm`, `md`, and `lg`. Root-provider override is not duplicated in this page because that is application configuration rather than a Breadcrumbs-owned state. |
| `a[kuiBreadcrumbItem]`                      | Native anchor with `kui-breadcrumb-link`; native href, keyboard focus, hover color, and focus-visible ring remain browser/library behavior.               | Default and size trails use a real link to the Playground home route. E2E clicks it and checks the destination, then captures keyboard focus-visible and pointer hover separately after clearing focus.                   |
| `span[kuiBreadcrumbItem]` without `current` | Plain grouping text, false current state by default, no `aria-current`.                                                                                   | Default trail and the plain-text grouping example show a non-link grouping crumb.                                                                                                                                         |
| `current` input                             | Boolean, defaults to `false`, and uses Angular's boolean-attribute transform. On a supported `<span>`, it adds `aria-current="page"` and current styling. | Every catalogue trail uses a current `<span>`; E2E checks the default current marker and that it is not a link.                                                                                                           |
| `li[kuiBreadcrumbSeparator]`                | No inputs or outputs. Renders a decorative chevron and `aria-hidden="true"`.                                                                              | Separators appear between crumbs across the page; E2E checks the separator count and hidden state.                                                                                                                        |
| Leading icon hook                           | Optional consumer markup using `.kui-breadcrumb-icon`; source docs constrain it to at most one icon on the first crumb.                                   | Composition example shows one decorative home icon in the first link, with the anchor named for assistive technology.                                                                                                     |
| `.kui-breadcrumb-truncate`                  | CSS-only helper for an individual crumb; no automatic overflow behavior.                                                                                  | Narrow-layout example applies the class to a long middle link and constrains the surrounding example using layout-only styles.                                                                                            |
| `.kui-breadcrumb-ellipsis`                  | CSS-only visual building block; menu and hidden-level behavior belong to the consumer.                                                                    | A labelled static slot preview only. Its entire list item is hidden from assistive technology; it is not an interactive button or a working menu.                                                                         |
| First-and-last pattern                      | Consumers remove hidden middle crumbs and their separators. Breadcrumbs does not collapse items itself.                                                   | Narrow-layout example includes only the first link, separator, and current item.                                                                                                                                          |
| Theme                                       | Breadcrumbs colors use generated semantic `--kui-*` variables; mode is owned by the persistent shell.                                                     | E2E captures the default dark view and toggles the shell to light for a second default example capture. No component-specific colors are overridden.                                                                      |
| Runtime locale                              | The page uses the shell-provided `breadcrumbs` Transloco scope; locale switching is not a Breadcrumbs input or state.                                     | E2E loads the Russian scope, switches through the shell, and checks the translated page title, group/navigation labels, link, and current crumb.                                                                          |

## States and edge cases

- Links, plain grouping spans, current spans, decorative separators, the first-crumb icon, all three sizes, hover, keyboard focus-visible, long middle-crumb truncation, static ellipsis placement, and first-plus-last composition are mapped to visible markup or E2E interaction above.
- Current content remains a span, so it is not in the tab order and has no `href`. The library input can technically be placed on an anchor and will still add `aria-current`; documentation says `current` is meaningful only on a span. That mismatch is recorded here and the unsupported combination is omitted.
- No model, output, disabled, loading, selected, expanded, validation, or open/closed state exists for Breadcrumbs. No API-driven collapse behavior exists. Those states are intentionally omitted.
- Density is inherited from the theme and has no Breadcrumbs-specific input or state. Theme mode stays shell-controlled.
- The approved visual record gate has no matching Breadcrumbs entry in `docs/design-provenance.md`, `docs/design-brief.md`, or `docs/design-system-spec.md`. Per parent approval, this page reproduces only existing released Breadcrumbs styles and documented native compositions; its styles arrange examples with Kikita spacing tokens and do not alter the primitive's visual treatment.

## Source references

- [Breadcrumbs documentation](../../../../../../../../../docs/breadcrumbs.md)
- [Breadcrumbs directive](../../../../../../../../ui/src/lib/components/breadcrumbs/kui-breadcrumbs.directive.ts)
- [Breadcrumb item directive](../../../../../../../../ui/src/lib/components/breadcrumbs/kui-breadcrumb-item.directive.ts)
- [Separator component](../../../../../../../../ui/src/lib/components/breadcrumbs/kui-breadcrumb-separator.component.ts)
- [Root size resolution](../../../../../../../../ui/src/lib/providers/kui-defaults.util.ts) and [default precedence](../../../../../../../../../docs/di-defaults.md)
- [Breadcrumbs unit tests](../../../../../../../../ui/src/lib/components/breadcrumbs/kui-breadcrumbs.component.spec.ts)
- [Breadcrumbs runtime styles](../../../../../../../../ui/src/styles/breadcrumbs.css) and [generated theme variables](../../../../../../../../ui/src/lib/theme/create-kui-theme.ts)
- [Public style entrypoint](../../../../../../../../ui/src/styles/kikita-ui.css)

## Self-review checklist

- [x] The page shows the Breadcrumbs entity, compact labelled examples, and a visible minimally configured default.
- [x] Every public input/default and meaningful supported state has a mapped example or a specific omission reason.
- [x] The page uses only public package exports, native breadcrumb semantics, existing library visual classes, and layout-only styles.
- [x] Composition, size, and narrow-layout sections live in page-private components under `components/`, keeping each template within the app's size budget.
- [x] The `current`-on-anchor mismatch and missing component-specific design provenance are recorded; neither is used to invent an example.
- [x] The ellipsis pattern is labelled as static consumer wiring and has no nonfunctional button or menu behavior.
- [x] English and Russian scope files have matching nested keys, and E2E checks the Russian scope after a runtime switch.
- [x] Scoped ESLint, Prettier, and EN/RU leaf-key parity checks pass (30 matching keys).
- [x] E2E cases use named accessible groups, named links, deterministic viewport sizes, real pointer/keyboard interaction, and SSR markup assertions.
- [x] Parent production/SSR build passed; the focused 9-test E2E suite passed with snapshot updates enabled and disabled after adding the runtime locale-switch scenario.
- [x] Parent route, translation scope, and shared SSR route registration are integrated.
- [x] Generated desktop, tablet, and 320px screenshots have been opened and visually reviewed for overflow, clipping, wrapping, and accurate labels; the independent reviewer approved the refreshed narrow-layout captures.
- [x] An independent reviewer has audited page anatomy, translations, accessibility, and this contract map.
