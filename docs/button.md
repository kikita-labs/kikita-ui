# Button

`kuiButton` applies Kikita UI button styling to native `button` and `a` elements.

## Import

```ts
import { KuiButtonAppearance, KuiButtonDirective, KuiButtonShape } from '@kikita-labs/ui';
```

## Usage

```html
<button kuiButton>Save</button>
<button kuiButton shape="soft">Cancel</button>
<button kuiButton shape="outline" appearance="danger">Delete</button>
<button kuiButton shape="ghost" appearance="success">Approve</button>
<button kuiButton appearance="warning">Review</button>
<button kuiButton wrap>Long responsive label</button>

<a kuiButton shape="outline" href="/settings">Settings</a>
```

`shape` controls the surface treatment and `appearance` controls its semantic color intent. The
axes can be combined freely.

Without an explicit `appearance`, `solid` and `soft` use primary colors while `outline` and
`ghost` use their neutral defaults.

Use `kui-icon` explicitly for icon content:

```html
<button kuiButton appearance="success">
  <kui-icon name="check" />
  Save
</button>
```

## Inputs

- `shape`: `solid | soft | outline | ghost`; defaults to `solid`.
- `appearance`: `primary | danger | success | warning`; optional.
- `size`: `xs | sm | md | lg`; defaults to `md`.
- `wrap`: allows long button text to wrap instead of truncating in narrow containers.
- `disabled`: disables button behavior. Anchor buttons receive `aria-disabled="true"` and are
  removed from tab order.

## Migration from 0.1.4

Button surface treatments moved from `appearance` to `shape`. Semantic color now belongs to
`appearance` and can be combined with every shape.

```html
<!-- Before -->
<button kuiButton appearance="outline">Details</button>

<!-- After -->
<button kuiButton shape="outline">Details</button>

<!-- New combination -->
<button kuiButton shape="outline" appearance="danger">Delete</button>
```

## Accessibility

Use native `button` whenever the action does not navigate. Use an `a` host only for navigation.
Every button needs an accessible name. Disabled native buttons use `disabled`; disabled anchors
use `aria-disabled="true"`, leave the tab order, and suppress navigation.

Native button keyboard behavior is preserved: `Enter` and `Space` activate a `button`; links use
native anchor keyboard behavior. The directive does not introduce a custom keyboard model.

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```
