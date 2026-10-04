# Badge

`kuiBadge` applies Kikita UI badge styling to inline status or metadata elements.

## Import

```ts
import { KuiBadge } from '@kikita-labs/ui';
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

## Provider Defaults

Set `defaults.badge` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    badge: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    badge: {
      /* options below */
    },
  }),
];
```

| Option | Values                         | Description                                                       |
| ------ | ------------------------------ | ----------------------------------------------------------------- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | Component size. Takes precedence over the global `defaults.size`. |

Each option resolves as `local input > defaults.badge.<option> > built-in default`. See [DI defaults](di-defaults.md).
