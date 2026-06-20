# Loader

`kuiLoader` applies Kikita UI loading indicator styling to an inline element.

## Import

```ts
import { KuiLoaderDirective } from '@kikita-labs/ui';
```

## Usage

```html
<span kuiLoader label="Loading"></span>

<button kuiButton disabled>
  <span kuiLoader size="sm" label="Saving"></span>
  Saving
</button>
```

The directive sets `role="status"` and `aria-live="polite"`.

## Inputs

- `size`: `xs | sm | md | lg`
- `label`: accessible label, default `Loading`

## CSS Variables

- `--kui-loader-size`
- `--kui-loader-track`
- `--kui-loader-fill`
- `--kui-loader-border-width`
- `--kui-loader-duration`
