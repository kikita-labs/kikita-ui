# Card

`kuiCard` applies Kikita UI card surface styling to semantic container elements.

## Import

```ts
import { KuiCardDirective } from '@kikita-labs/ui';
```

## Usage

```html
<article kuiCard>
  <h3>Default surface</h3>
  <p>Grouped content with Kikita border, radius, and surface tokens.</p>
</article>

<button kuiCard interactive type="button">Interactive card</button>
```

Use real semantic elements: `article`, `section`, `aside`, `button`, or `a` depending on behavior.

## Inputs

- `appearance`: `surface | elevated | sunken`
- `interactive`: enables hover and focus-visible affordances

## CSS Variables

- `--kui-card-bg`
- `--kui-card-bg-elevated`
- `--kui-card-bg-sunken`
- `--kui-card-border`
- `--kui-card-border-elevated`
- `--kui-card-border-sunken`
- `--kui-card-border-hover`
- `--kui-card-radius`
- `--kui-card-padding`
- `--kui-card-shadow`
- `--kui-card-shadow-elevated`
- `--kui-card-shadow-sunken`
- `--kui-card-shadow-hover`
