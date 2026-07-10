# IconButton

`kuiIconButton` applies square icon-button styling to native `button` and `a` elements. It uses
the same independent `shape` and `appearance` axes as `kuiButton`.

## Import

```ts
import { KuiIconButtonDirective } from '@kikita-labs/ui';
```

## Usage

```html
<button kuiIconButton aria-label="Close">
  <kui-icon name="x" />
</button>

<button kuiIconButton shape="soft" appearance="success" aria-label="Approve">
  <kui-icon name="check" />
</button>

<a kuiIconButton shape="outline" appearance="primary" href="/settings" aria-label="Settings">
  <kui-icon name="settings" />
</a>
```

## Inputs

- `shape`: `solid | soft | outline | ghost`; defaults to `ghost`.
- `appearance`: `primary | danger | success | warning`; optional.
- `size`: `xs | sm | md | lg`; defaults to `md`.
- `disabled`: disables icon button behavior. Anchor icon buttons receive `aria-disabled="true"`
  and are removed from tab order.

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
