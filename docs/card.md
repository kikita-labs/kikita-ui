# Card

`kuiCard` applies Kikita UI card surface styling to semantic container elements.

## Usage

```ts
import { KuiCard } from '@kikita-labs/ui';
```

Import `@kikita-labs/ui/styles` once in the application stylesheet to load Card's runtime styles.

```html
<article kuiCard>
  <h3>Default surface</h3>
  <p>Grouped content with Kikita border, radius, and surface tokens.</p>
</article>

<button kuiCard interactive type="button">Interactive card</button>
```

Choose a native host that matches the content and behavior: `article`, `section`, or `aside` for
content; `button` for an action; and `a` with an `href` for navigation.

## API

| Input         | Type                           | Default and behavior                                                                                                      |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `appearance`  | `KuiCardAppearance`            | `surface`. Supports `surface`, `elevated`, and `sunken`; it has no inherited default or input transform.                  |
| `size`        | `KuiSize \| undefined`         | Explicit local size wins, then `provideKikitaUi({ defaults: { size } })`, then `md`. Supports `xs`, `sm`, `md`, and `lg`. |
| `interactive` | `boolean` (`booleanAttribute`) | `false`. Enabling it adds pointer cursor, hover, and focus-visible styling to the host.                                   |

The directive has no outputs or models.

## Provider Defaults

Set `defaults.card` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    card: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    card: {
      /* options below */
    },
  }),
];
```

| Option       | Values                                | Description                                                       |
| ------------ | ------------------------------------- | ----------------------------------------------------------------- |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg'`        | Component size. Takes precedence over the global `defaults.size`. |
| `appearance` | `'surface' \| 'elevated' \| 'sunken'` | Default appearance.                                               |

Each option resolves as `local input > defaults.card.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Accessibility

`kuiCard` styles its host; it does not add a role, `tabindex`, activation behavior, or keyboard
handlers. `interactive` only supplies visual affordances. Use a native `button` for an action or an
`a` element with an `href` for navigation so the browser provides focus and keyboard activation.
Card has no disabled, selected, pressed, or form state of its own; native host behavior remains
owned by the host element.

## Styles and CSS Variables

Import the public styles once in the application stylesheet:

```scss
@import '@kikita-labs/ui/styles';
```

The Card-specific variables are:

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

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token              | Default            | Controls |
| ------------------ | ------------------ | -------- |
| `--kui-card-color` | `--kui-color-text` | Color    |

<!-- color-tokens:end -->
