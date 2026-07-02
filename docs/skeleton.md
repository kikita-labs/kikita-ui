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

## Accessibility

- Skeleton is decorative placeholder chrome and must not expose text to assistive technology.
- Do not make skeleton hosts focusable or interactive.
- Use Loader instead when the UI needs an announced loading status.
- Respect `prefers-reduced-motion`; Kikita disables skeleton animation under reduced motion.

## Styling

Import `@kikita-labs/ui/styles` once in the app. Skeleton uses `--kui-skeleton-*` tokens for
geometry and animation and `--kui-color-skeleton-*` semantic tokens for theme colors.
