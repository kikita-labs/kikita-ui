# Breadcrumbs

Navigation trail showing the current page's position in a hierarchy. `[kuiBreadcrumbs]` is a directive on the native `<ol>`; crumbs are native `<a>`/`<span>` elements marked with `[kuiBreadcrumbItem]`.

## Import

```ts
import {
  KuiBreadcrumbsDirective,
  KuiBreadcrumbItemDirective,
  KuiBreadcrumbSeparatorComponent,
} from '@kikita-labs/ui';
```

## Usage

```html
<nav aria-label="Breadcrumb">
  <ol kuiBreadcrumbs>
    <li><a kuiBreadcrumbItem href="/components">Components</a></li>
    <li kuiBreadcrumbSeparator></li>
    <li><a kuiBreadcrumbItem href="/components/actions">Actions</a></li>
    <li kuiBreadcrumbSeparator></li>
    <li><span kuiBreadcrumbItem current>Icon Button</span></li>
  </ol>
</nav>
```

### Plain-text (non-link) crumb

Use a `<span kuiBreadcrumbItem>` without `current` for a grouping crumb that has no page of its own:

```html
<li><a kuiBreadcrumbItem href="/catalog">Catalog</a></li>
<li kuiBreadcrumbSeparator></li>
<li><span kuiBreadcrumbItem>Electronics</span></li>
<li kuiBreadcrumbSeparator></li>
<li><span kuiBreadcrumbItem current>Headphones</span></li>
```

### Leading icon

At most one optional leading icon, on the first crumb only:

```html
<li>
  <a kuiBreadcrumbItem href="/">
    <span class="kui-breadcrumb-icon"><svg>...</svg></span>
  </a>
</li>
```

### Sizes

```html
<ol kuiBreadcrumbs size="sm">
  ...
</ol>
<ol kuiBreadcrumbs size="lg">
  ...
</ol>
```

### Responsive / narrow screens

The library does not enforce a single collapse strategy; pick the one that fits the consumer app and hierarchy depth:

- **Truncate a middle crumb** — add `.kui-breadcrumb-truncate` to the `<a>`/`<span>` that should shrink with an ellipsis; keep the trail's `<ol>` non-wrapping (`style="flex-wrap: nowrap"`).
- **Collapse behind an ellipsis menu** — render a `<button class="kui-breadcrumb-ellipsis">` in place of the hidden crumbs and wire it to an existing `kui-menu`/`kui-dropdown` listing the hidden levels. Breadcrumbs does not manage this menu itself.
- **First + last only** — drop the middle crumbs and separators entirely at the narrowest breakpoint.

## Inputs - `[kuiBreadcrumbs]`

- `size`: `sm | md | lg` (default: `md`)

## Inputs - `[kuiBreadcrumbItem]`

- `current`: `boolean` (default: `false`). Only meaningful on `<span>`; sets `aria-current="page"`.

## Provider Defaults

Set `defaults.breadcrumbs` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    breadcrumbs: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  kuiProvideDefaults({
    breadcrumbs: {
      /* options below */
    },
  }),
];
```

| Option | Values                 | Description                                                       |
| ------ | ---------------------- | ----------------------------------------------------------------- |
| `size` | `'sm' \| 'md' \| 'lg'` | Component size. Takes precedence over the global `defaults.size`. |

Each option resolves as `local input > defaults.breadcrumbs.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Accessibility

- Wrap the trail in `<nav aria-label="Breadcrumb">` (or a localized label).
- `[kuiBreadcrumbs]` sets `role="list"` on the `<ol>` to restore list semantics after `list-style: none`.
- Link crumbs are native `<a>`, focusable with a visible `:focus-visible` ring.
- The current crumb is a `<span aria-current="page">`, not a link, and is not in tab order.
- `[kuiBreadcrumbSeparator]` renders a decorative chevron `<li aria-hidden="true">`, never read by assistive technology.

Breadcrumb links intentionally do not compose `[kuiLink]`. Breadcrumbs owns its
navigation-specific spacing, responsive size scale, color tokens, separator
relationship, and current-page treatment; applying generic Link styling would
create competing visual contracts. Keep navigable crumbs as native anchors with
`[kuiBreadcrumbItem]`.

## Explicitly Not Included

- A dropdown/menu embedded in a single crumb (navigating on click, not choosing from a list) — that is a Menu/Dropdown use case, not Breadcrumbs.
- A dedicated icon system per crumb — at most one optional leading icon.
- Automatic overflow collapse logic — `.kui-breadcrumb-truncate` and `.kui-breadcrumb-ellipsis` are CSS-only building blocks; wiring an ellipsis menu is left to the consumer.

## CSS Variables

- `--kui-breadcrumbs-gap`
- `--kui-breadcrumb-fg`
- `--kui-breadcrumb-fg-hover`
- `--kui-breadcrumb-fg-current`
- `--kui-breadcrumb-font-weight-current`

## Style Import

Import `@kikita-labs/ui/styles` (which includes `breadcrumbs.css`) once in your application styles.

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                    | Default                        | Controls                   |
| ---------------------------------------- | ------------------------------ | -------------------------- |
| `--kui-breadcrumb-link-focus-ring-color` | `--kui-color-focus`            | Link focus ring color      |
| `--kui-breadcrumb-sep-color`             | `--kui-color-text-secondary`   | Sep color                  |
| `--kui-breadcrumb-ellipsis-color`        | `--kui-color-text-secondary`   | Ellipsis color             |
| `--kui-breadcrumb-ellipsis-bg-hover`     | `--kui-color-surface-elevated` | Ellipsis background, hover |
| `--kui-breadcrumb-ellipsis-color-hover`  | `--kui-color-text`             | Ellipsis color, hover      |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                      | Default              | Controls                          |
| ------------------------------------------ | -------------------- | --------------------------------- |
| `--kui-breadcrumb-font-size`               | `--kui-text-sm-size` | Font size                         |
| `--kui-breadcrumb-link-radius`             | `--kui-radius-sm`    | Link corner radius                |
| `--kui-breadcrumb-link-gap`                | `--kui-space-1`      | Link gap                          |
| `--kui-breadcrumb-plain-gap`               | `--kui-space-1`      | Plain gap                         |
| `--kui-breadcrumb-current-gap`             | `--kui-space-1`      | Current gap                       |
| `--kui-breadcrumb-ellipsis-padding-inline` | `--kui-space-1`      | Ellipsis padding, inline          |
| `--kui-breadcrumb-ellipsis-radius`         | `--kui-radius-sm`    | Ellipsis corner radius            |
| `--kui-breadcrumb-font-size-sm`            | `--kui-text-xs-size` | Font size, sm                     |
| `--kui-breadcrumb-font-size-lg`            | `--kui-text-md-size` | Font size, lg                     |
| `--kui-breadcrumb-ellipsis-height`         | `22px`               | Ellipsis button height            |
| `--kui-breadcrumb-ellipsis-height-sm`      | `18px`               | Ellipsis button height, sm        |
| `--kui-breadcrumb-ellipsis-height-lg`      | `26px`               | Ellipsis button height, lg        |
| `--kui-breadcrumb-icon-size-sm`            | `12px`               | Separator and icon size, sm       |
| `--kui-breadcrumb-icon-size-lg`            | `16px`               | Separator and icon size, lg       |
| `--kui-breadcrumb-truncate-max-width`      | `140px`              | Maximum width of a truncated item |

<!-- geometry-tokens:end -->
