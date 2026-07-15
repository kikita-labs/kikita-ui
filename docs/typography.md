# Typography

Typography is a CSS-only primitive exposed through `@kikita-labs/ui/styles`.

It provides semantic type-role classes and color tone utilities. The classes decorate native
HTML elements; they do not replace semantic headings, paragraphs, labels, small text, or code.
Angular consumers can also use the `kuiText` directive as convenience sugar over the same
classes.

## Import

```ts
import '@kikita-labs/ui/styles/kikita-ui.css';
```

## Usage

```html
<h1 class="kui-heading-lg kui-text-default">Workspace settings</h1>
<p class="kui-body kui-text-muted">Manage members, billing, and integrations.</p>
<small class="kui-caption kui-text-muted">Updated 2 minutes ago</small>
<code class="kui-code">workspace.slug</code>
```

Directive usage:

```ts
import { KuiTextDirective } from '@kikita-labs/ui';
```

```html
<h1 kuiText variant="heading-lg">Workspace settings</h1>
<p kuiText variant="body" tone="muted">Manage members, billing, and integrations.</p>
<small kuiText variant="caption" tone="danger">This slug is already taken.</small>
```

## Type Roles

| Class             | Native elements    | Use                                           |
| ----------------- | ------------------ | --------------------------------------------- |
| `.kui-display`    | `h1`               | Rare docs/spec page title                     |
| `.kui-heading-lg` | `h1`, `h2`         | Main page or top-level section title          |
| `.kui-heading-md` | `h2`, `h3`         | Panel, dialog, or drawer title                |
| `.kui-heading-sm` | `h3`, `h4`         | Compact section, card, or table group title   |
| `.kui-title`      | `h4`, `h5`, `span` | Small emphasized UI title                     |
| `.kui-body-lg`    | `p`                | Relaxed paragraph text where space allows     |
| `.kui-body`       | `p`                | Default product UI body text                  |
| `.kui-body-sm`    | `p`, `span`        | Dense descriptions and table adjunct text     |
| `.kui-caption`    | `small`, `span`    | Hints, metadata, helper text, timestamps      |
| `.kui-overline`   | `span`             | Optional uppercase group label; use sparingly |
| `.kui-code`       | `code`, `span`     | Inline monospace code and token text          |

## Tone Utilities

Tone utilities only set `color`, so they can combine with any type role.

```html
<p class="kui-body-sm kui-text-success">Backup completed.</p>
<p class="kui-caption kui-text-danger">This slug is already taken.</p>
```

Available classes:

```css
.kui-text-default
.kui-text-muted
.kui-text-disabled
.kui-text-primary
.kui-text-success
.kui-text-warning
.kui-text-danger
```

Do not use color alone to communicate critical status. Pair status color with surrounding text,
an icon, or a visible label when the state matters.

## API

`kuiText` is an attribute directive for native text elements.

| Input     | Type             | Default     | Description               |
| --------- | ---------------- | ----------- | ------------------------- |
| `variant` | `KuiTextVariant` | `'body'`    | Semantic typography role. |
| `tone`    | `KuiTextTone`    | `'default'` | Semantic text color tone. |

## Tokens

Each role has a size, line-height, and weight token:

```css
--kui-type-heading-md-size
--kui-type-heading-md-line-height
--kui-type-heading-md-weight
```

The same triplet exists for every role. Size tokens reuse the existing `--kui-text-*-size`
scale, and weights use:

```css
--kui-font-weight-regular
--kui-font-weight-medium
--kui-font-weight-semibold
--kui-font-weight-bold
```

## Accessibility

- Keep native heading order meaningful; classes are visual only.
- Prefer `small` for captions and `code` for inline code where those semantics apply.
- Ensure status copy does not depend on color alone.
- Let long text wrap; reserve truncation for local row layouts where the container owns overflow.
