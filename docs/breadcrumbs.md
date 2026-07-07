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

## Accessibility

- Wrap the trail in `<nav aria-label="Breadcrumb">` (or a localized label).
- `[kuiBreadcrumbs]` sets `role="list"` on the `<ol>` to restore list semantics after `list-style: none`.
- Link crumbs are native `<a>`, focusable with a visible `:focus-visible` ring.
- The current crumb is a `<span aria-current="page">`, not a link, and is not in tab order.
- `[kuiBreadcrumbSeparator]` renders a decorative chevron `<li aria-hidden="true">`, never read by assistive technology.

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
