# Badge

`kuiBadge` applies Kikita UI badge styling to inline status or metadata elements.

## Import

```ts
import { KuiBadgeDirective } from '@kikita-labs/ui';
```

## Usage

```html
<span kuiBadge>Neutral</span>
<span kuiBadge appearance="success">Ready</span>
<span kuiBadge appearance="danger">Error</span>
```

`kuiBadge` is an attribute directive so it can be used on inline semantic elements such as `span`,
`strong`, `code`, or `a`.

## Inputs

- `appearance`: `neutral | primary | success | warning | danger | info`
- `size`: `xs | sm | md | lg`

## CSS Variables

- `--kui-badge-height`
- `--kui-badge-px`
- `--kui-badge-radius`
- `--kui-badge-font-size`
- `--kui-badge-neutral-bg`
- `--kui-badge-primary-bg`
- `--kui-badge-success-bg`
- `--kui-badge-warning-bg`
- `--kui-badge-danger-bg`
- `--kui-badge-info-bg`
