# Progress

`kui-progress` renders linear or circular progress using Kikita UI tokens.

## Import

```ts
import { KuiProgressComponent } from '@kikita-labs/ui';
```

## Linear

```html
<kui-progress value="60" aria-label="Upload progress" />
```

Set `value` to a number from `0` to `100`. Values are clamped visually.

## Indeterminate

Omit `value` or pass `null` when progress is unknown:

```html
<kui-progress aria-label="Loading" />
```

## Circular

```html
<kui-progress type="circular" size="lg" color="success" [value]="72" aria-label="72%">
  72%
</kui-progress>
```

Projected content is rendered in the center of circular progress.

## Inputs

| Input   | Type                                                           | Default     | Notes                                  |
| ------- | -------------------------------------------------------------- | ----------- | -------------------------------------- |
| `type`  | `'linear' \| 'circular'`                                       | `'linear'`  | Progress shape.                        |
| `value` | `number \| null`                                               | `null`      | `null` means indeterminate.            |
| `color` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `'primary'` | Semantic color.                        |
| `size`  | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                         | `'md'`      | Linear thickness or circular diameter. |

## Accessibility

The host uses `role="progressbar"`, `aria-valuemin="0"`, and
`aria-valuemax="100"`. Determinate progress also sets `aria-valuenow`.

Always provide an accessible name with `aria-label` or `aria-labelledby`.

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```

Progress styles live in `projects/ui/src/styles/progress.css` and are included
through `@kikita-labs/ui/styles`.
