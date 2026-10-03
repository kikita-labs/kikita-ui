# Badge Contract Inventory

This inventory maps the public Badge contract to the page examples. The directive styles its host; it does not add roles, interaction handlers, or state behavior.

## Public inputs and coverage

| Input        | Type, default, and resolution                                                                                                                                                                      | Page coverage                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appearance` | `KuiBadgeAppearance`; `input<KuiBadgeAppearance>('neutral')`. Supported values are `neutral`, `primary`, `success`, `warning`, `danger`, and `info`; no transform or inherited appearance applies. | The minimal default omits the input and shows `neutral`. The appearance/size matrix renders all six values at all four sizes.                                                                                                                                               |
| `size`       | `KuiSize \| undefined`; `input<KuiSize \| undefined>()`. Resolution is local input, then configured Kikita UI root size, then `md`.                                                                | The minimal default omits the input and shows `md`. The matrix renders `xs`, `sm`, `md`, and `lg`. The app has no root size default, so a provider override is omitted here; root size inheritance is a shared defaults contract rather than a Badge-specific visual state. |

There are no Badge outputs or models. Every appearance × size combination is shown; host semantics are sampled separately because the same appearance/size styling applies to each documented inline host.

## Semantics, styling, and states

- The documented host examples are `span`, `strong`, `code`, and `a`. The page includes all four; the anchor remains a native link and keyboard Enter follows its local target.
- The directive adds the `kui-badge` class and `data-kui-appearance` / `data-kui-size` attributes only. It does not add an ARIA role or interaction state.
- The stylesheet defines a neutral base treatment, five appearance token mappings, and explicit `xs`, `sm`, and `lg` overrides; `md` uses the base values. The page uses the library's active theme and does not override its visual tokens.
- The page has no focus, hover, pressed, disabled, invalid, loading, or selected Badge state to demonstrate. Focus and activation belong to the native anchor host; disabled and form states are not part of this directive's contract.
- The CSS variables in the Badge docs are theming hooks, not inputs. The page does not turn them into an editor or fabricate alternate token values.

## Source audit

- [Badge docs](../../../../../../../../../docs/badge.md) list appearance and size values and the supported host semantics, but do not state source defaults or root-size precedence.
- [Directive source](../../../../../../../../../projects/ui/src/lib/components/badge/kui-badge.directive.ts), [appearance type](../../../../../../../../../projects/ui/src/lib/components/badge/kui-badge-appearance.type.ts), and [shared size type](../../../../../../../../../projects/ui/src/lib/types/kui-size.type.ts) establish the exact input signatures and defaults. The [root-default helper](../../../../../../../../../projects/ui/src/lib/providers/kui-defaults.util.ts) supplies local → root → `md` resolution.
- [Badge stylesheet](../../../../../../../../../projects/ui/src/styles/badge.css) maps appearance tokens and size geometry. [Unit tests](../../../../../../../../../projects/ui/src/lib/components/badge/kui-badge.directive.spec.ts) verify the host class and explicit appearance/size attributes; this page adds the complete visible matrix, default assertion, semantic hosts, and real anchor activation.

## Omitted combinations

- No appearance or size value is omitted. The full 6 × 4 matrix covers the visual cross product.
- The host-element examples do not repeat all 24 combinations because host semantics do not alter the directive's appearance/size contract.
- A root-provider size override is omitted because this app uses no root size default. The example shows the actual fallback, and provider precedence is owned by the shared defaults contract.
- Disabled, invalid, loading, selected, and other component states are omitted because `KuiBadgeDirective` exposes only `appearance` and `size` and defines no interaction or state selectors.

## Self-review checklist

- [x] A minimally configured default and the full 6 × 4 appearance/size matrix are visible.
- [x] Host semantics, native link activation, defaults, and documented omissions are mapped to examples or browser checks.
- [x] English and Russian Badge catalogues contain matching key sets.
- [x] Desktop and 320px screenshot baselines were reviewed; the mobile browser check confirms there is no document-level horizontal overflow.
- [x] Independent review, quality checks, and the page-only commit are recorded in the rollout tracker.
