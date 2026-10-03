# Skeleton

`[kuiSkeleton]` applies a non-semantic placeholder treatment to an existing HTML element while
known content is loading.

## Import

```ts
import { KuiSkeletonDirective } from '@kikita-labs/ui';
```

## Usage

```html
<section aria-busy="true">
  <span kuiSkeleton shape="heading" style="inline-size: 180px"></span>
  <span kuiSkeleton shape="text" style="inline-size: 80%"></span>
  <span kuiSkeleton shape="button" style="inline-size: 96px"></span>
</section>
```

Skeleton hosts are automatically `aria-hidden="true"`. Put `aria-busy="true"` on the loading
region, not on every skeleton block.

## Inputs

- `shape`: `text | heading | rect | circle | square | button | badge`
- `animation`: `shimmer | pulse | none`

## Provider Defaults

Set `defaults.skeleton` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    skeleton: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  kuiProvideDefaults({
    skeleton: {
      /* options below */
    },
  }),
];
```

| Option      | Values                                                                         | Description        |
| ----------- | ------------------------------------------------------------------------------ | ------------------ |
| `shape`     | `'text' \| 'heading' \| 'rect' \| 'circle' \| 'square' \| 'button' \| 'badge'` | Default shape.     |
| `animation` | `'shimmer' \| 'pulse' \| 'none'`                                               | Default animation. |

Each option resolves as `local input > defaults.skeleton.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Accessibility

- Skeleton is decorative placeholder chrome and must not expose text to assistive technology.
- Do not make skeleton hosts focusable or interactive.
- Use Loader instead when the UI needs an announced loading status.
- Respect `prefers-reduced-motion`; Kikita disables skeleton animation under reduced motion.

## Styling

Import `@kikita-labs/ui/styles` once in the app. Skeleton uses `--kui-skeleton-*` tokens for
geometry and animation and `--kui-color-skeleton-*` semantic tokens for theme colors.

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                           | Default           | Controls               |
| ------------------------------- | ----------------- | ---------------------- |
| `--kui-skeleton-radius-text`    | `--kui-radius-xs` | Corner radius, text    |
| `--kui-skeleton-radius-heading` | `--kui-radius-xs` | Corner radius, heading |
| `--kui-skeleton-radius-button`  | `--kui-radius-md` | Corner radius, button  |

<!-- geometry-tokens:end -->
