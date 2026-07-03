# Kikita UI Ember Design System Spec

This document is derived from the Claude Design exports in `.local-notes/claude-design/design system/`.

The repository remains the source of truth. The HTML exports are reference material only.

## Direction

Ember is a warm, precise, dark-capable direction for `@kikita-labs/ui`.

It is not a component API clone of another library. It defines token architecture, visual defaults, theming rules, and the first playground board direction.

## Token Architecture

Kikita UI uses four token tiers:

1. Seed tokens: engineer-owned customization inputs.
2. Palette tokens: generated 12-step OKLCH ramps.
3. Semantic tokens: light/dark intent aliases consumed by components.
4. Component tokens: per-component variables that reference semantic tokens.

Flow:

```text
--kui-seed-* -> --kui-{scale}-{1..12} -> --kui-color-* -> --kui-btn-* / --kui-input-* / component CSS
```

Components must not consume palette tokens directly. Components consume semantic tokens or component tokens.

## Ember Seed Tokens

Ember starts with six color seeds:

```css
:root {
  --kui-seed-primary: oklch(0.52 0.25 285);
  --kui-seed-neutral: oklch(0.5 0.01 80);
  --kui-seed-success: oklch(0.54 0.16 145);
  --kui-seed-warning: oklch(0.74 0.16 75);
  --kui-seed-danger: oklch(0.54 0.22 25);
  --kui-seed-info: oklch(0.58 0.16 215);
}
```

The library API should accept these through typed theme seeds, not by requiring users to hand-author every semantic token.

## Palette Generation

Each chromatic seed generates a 12-step OKLCH ramp.

Default lightness stops:

```ts
const lightness = [0.97, 0.93, 0.87, 0.78, 0.67, seed.l, 0.42, 0.32, 0.23, 0.16, 0.12, 0.08];
```

Default chroma multipliers:

```ts
const chromaScale = [0.08, 0.15, 0.35, 0.6, 0.85, 1, 0.9, 0.75, 0.55, 0.35, 0.22, 0.12];
```

Step 6 is the seed value. The neutral ramp keeps chroma intentionally low.

## Semantic Colors

Semantic colors are rebound between light and dark themes.

Core surface tokens:

```css
--kui-color-bg
--kui-color-surface
--kui-color-surface-elevated
--kui-color-surface-sunken
--kui-color-border
--kui-color-border-strong
--kui-color-text
--kui-color-text-secondary
--kui-color-text-disabled
```

Intent tokens:

```css
--kui-color-primary-fill
--kui-color-primary-fill-hover
--kui-color-primary-fill-active
--kui-color-primary-soft-bg
--kui-color-primary-soft-text
--kui-color-primary-focus-ring
--kui-color-success-fill
--kui-color-warning-fill
--kui-color-danger-fill
--kui-color-info-fill
```

Light and dark modes should differ by semantic rebinding, not by duplicating component styles.

## Component Tokens

Initial component token families:

```css
--kui-btn-*
--kui-field-*
--kui-input-*
--kui-badge-*
--kui-alert-*
--kui-dialog-*
--kui-tooltip-*
```

Phase 1 implementation focuses on `kui-button`, `kui-icon-button`, `kui-field`, `kui-input`, and the playground board.

## Base Scales

Base scale families:

```css
--kui-radius-*
--kui-space-*
--kui-text-*
--kui-shadow-*
--kui-motion-*
```

Spacing uses a 4px base. Letter spacing defaults to `0`.

## Density

Supported density values:

```ts
type KuiDensity = 'compact' | 'regular' | 'comfortable';
```

Recommended control sizes:

| Token            | Compact | Regular | Comfortable |
| ---------------- | ------: | ------: | ----------: |
| Button height    |    24px |    32px |        40px |
| Button x padding |     8px |    12px |        16px |
| Input height     |    28px |    40px |        44px |

Density should be expressible globally through providers and locally through a future density directive/attribute.

```css
[data-kui-density='compact'] {
  --kui-btn-height: var(--kui-btn-height-compact);
  --kui-btn-px: var(--kui-btn-px-compact);
  --kui-input-height: var(--kui-control-height-xs);
}

[data-kui-density='comfortable'] {
  --kui-btn-height: var(--kui-btn-height-comfortable);
  --kui-btn-px: var(--kui-btn-px-comfortable);
  --kui-input-height: var(--kui-control-height-lg);
}
```

## Responsive Rules

The playground board must show desktop and narrow-width behavior.

Rules:

- Forms become single-column on narrow screens.
- Inputs become full-width on narrow screens.
- Comfortable density may be enforced for touch-heavy mobile contexts.
- Tables and dense data components are deferred until there is a real roadmap need.

## Accessibility

Baseline requirements:

- Prefer native HTML semantics before ARIA.
- Meet WCAG AA contrast for text and controls.
- Provide visible focus states for keyboard users.
- Support disabled, hover, active, focus, loading, error, and success states where relevant.
- Use Angular CDK or Angular Aria for complex accessibility behavior.

## Angular API Direction

Provider direction:

```ts
provideKikitaUi({
  density: 'regular',
  theme: {
    seeds: {
      color: {
        primary: 'oklch(0.52 0.25 285)',
        neutral: 'oklch(0.5 0.01 80)',
        success: 'oklch(0.54 0.16 145)',
        warning: 'oklch(0.74 0.16 75)',
        danger: 'oklch(0.54 0.22 25)',
        info: 'oklch(0.58 0.16 215)',
      },
      radius: 8,
      density: 'regular',
    },
  },
});
```

New Angular services use `@Service()` in Angular 22+ unless a specific DI pattern requires `@Injectable`.
