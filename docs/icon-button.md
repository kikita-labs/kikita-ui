# IconButton

`kuiIconButton` applies square icon-button styling to native `button` and `a` elements. It uses
the same independent `shape` and `appearance` axes as `kuiButton`.

## Import

```ts
import { KuiIconButtonDirective } from '@kikita-labs/ui';
```

## Usage

Use `icon` for a registered icon by name, instead of hand-projecting `kui-icon`:

```html
<button kuiIconButton icon="x" aria-label="Close"></button>

<button kuiIconButton shape="soft" appearance="success" icon="check" aria-label="Approve"></button>

<a
  kuiIconButton
  shape="outline"
  appearance="primary"
  href="/settings"
  icon="settings"
  aria-label="Settings"
></a>
```

Project `kui-icon` directly when the icon needs `source` or `src` instead of a registered `name`:

```html
<button kuiIconButton aria-label="Close">
  <kui-icon [source]="closeIcon" />
</button>
```

Use `loading` to show a spinner in place of the icon while an action is pending:

```html
<button kuiIconButton icon="check" loading aria-label="Save"></button>
```

## Inputs

- `shape`: `solid | soft | outline | ghost`; defaults to `ghost`.
- `appearance`: `primary | danger | success | warning`; optional.
- `size`: `xs | sm | md | lg`; defaults to `provideKikitaUi({ defaults.size })`, then `md`.
- `disabled`: disables icon button behavior. Anchor icon buttons receive `aria-disabled="true"`
  and are removed from tab order.
- `loading`: replaces the icon (and any projected content) with a centered spinner, disables the
  host the same way `disabled` does, and sets `aria-busy="true"`. The host keeps its footprint.
- `icon`: renders a `kui-icon` resolved by name, prepended before any other projected content.

## Provider Defaults

Use `kuiProvideButtonOptions` to configure repeated icon-button defaults:

```ts
providers: [
  kuiProvideButtonOptions({
    iconButton: { shape: 'outline', appearance: 'primary', size: 'sm' },
  }),
];
```

Use root `provideKikitaUi({ defaults: { size: 'sm' } })` for broad default sizing across all
size-enabled primitives. Local inputs always win.

## Migration from 0.1.4

Move `solid`, `soft`, `outline`, and `ghost` values from `appearance` to `shape`. Keep semantic
values such as `danger` in `appearance`.

```html
<!-- Before -->
<button kuiIconButton appearance="outline" aria-label="Settings">...</button>

<!-- After -->
<button kuiIconButton shape="outline" aria-label="Settings">...</button>
```

## Accessibility

Icon-only controls must have an accessible label, normally through `aria-label`. Use native
`button` for actions and `a` for navigation.

Native button and anchor keyboard behavior is preserved. The directive adds no custom key
bindings.

## Styles

Import `@kikita-labs/ui/styles` once in the consumer application.
