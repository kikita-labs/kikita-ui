# IconButton

`kuiIconButton` applies square icon-button styling to native `button` and `a` elements.

## Import

```ts
import { KuiIconButtonDirective } from '@kikita-labs/ui';
```

## Usage

```html
<button kuiIconButton aria-label="Close">
  <kui-icon name="x" />
</button>

<a kuiIconButton href="/settings" aria-label="Settings">
  <kui-icon name="settings" />
</a>
```

## Inputs

- `appearance`: `solid | soft | outline | ghost | danger`
- `size`: `xs | sm | md | lg`
- `disabled`: disables icon button behavior. Anchor icon buttons receive `aria-disabled="true"` and are removed from tab order.

Icon-only controls must have an accessible label.

`primary` and `secondary` are accepted as temporary aliases for `solid` and `soft`.
