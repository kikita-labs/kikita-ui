# Button

`kuiButton` applies Kikita UI button styling to native `button` and `a` elements.

## Import

```ts
import { KuiButtonDirective } from '@kikita-labs/ui';
```

## Usage

```html
<button kuiButton>Save</button>
<button kuiButton appearance="soft">Cancel</button>
<button kuiButton appearance="outline" size="sm">Details</button>
<button kuiButton appearance="danger">Delete</button>

<a kuiButton href="/settings">Settings</a>
```

Use `kui-icon` explicitly for icon content:

```html
<button kuiButton>
  <kui-icon name="check" />
  Save
</button>
```

## Inputs

- `appearance`: `solid | soft | outline | ghost | danger`
- `size`: `xs | sm | md | lg`
- `disabled`: disables button behavior. Anchor buttons receive `aria-disabled="true"` and are removed from tab order.

`primary` and `secondary` are accepted as temporary aliases for `solid` and `soft`.

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```
