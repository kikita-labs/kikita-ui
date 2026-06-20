# Group

`kuiGroup` groups adjacent Kikita UI controls and can collapse their shared borders.

## Import

```ts
import { KuiGroupDirective } from '@kikita-labs/ui';
```

## Usage

```html
<div kuiGroup collapsed>
  <button kuiButton appearance="outline">One</button>
  <button kuiButton appearance="outline">Two</button>
  <button kuiIconButton appearance="outline" aria-label="More">
    <kui-icon name="more" />
  </button>
</div>
```

## Inputs

- `orientation`: `horizontal | vertical`
- `size`: `xs | sm | md | lg`
- `collapsed`: collapses adjacent borders
- `rounded`: keeps outer corners rounded when collapsed
