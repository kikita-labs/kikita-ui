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
- `label`: accessible label, default: the `common.loading` message (`Loading`)

## CSS Variables

- `--kui-loader-size`
- `--kui-loader-track`
- `--kui-loader-fill`
- `--kui-loader-border-width`
- `--kui-loader-duration`

## Provider Defaults

Set `defaults.loader` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    loader: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  kuiProvideDefaults({
    loader: {
      /* options below */
    },
  }),
];
```

| Option | Values                         | Description                                                       |
| ------ | ------------------------------ | ----------------------------------------------------------------- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | Component size. Takes precedence over the global `defaults.size`. |

Each option resolves as `local input > defaults.loader.<option> > built-in default`. See [DI defaults](di-defaults.md).
