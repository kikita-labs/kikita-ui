# Link

Inline interactive text for navigation or a JS-driven action -- visually `Text`, but clickable.
`[kuiLink]` is a directive on a native `<a href>` (real navigation) or `<button type="button">`
(no navigation), the same `<a>`/`<button>` fork `[kuiButton]` already uses.

`[kuiLink]` composes `[kuiText]` internally via Angular's Directive Composition API
(`hostDirectives`), exposing only `[kuiText]`'s `variant` input. You never add `[kuiText]` to the
template yourself -- one directive, one attribute per concern. `[kuiLink]`'s `tone` is its own
input with its own color tokens and states; it is unrelated to `[kuiText]`'s own `tone` input
(which stays at its default and has no visible effect, since `[kuiLink]`'s own stylesheet layer
always wins for color).

## Import

```ts
import { KuiLinkDirective } from '@kikita-labs/ui';
```

## Usage

```html
<a kuiLink href="/docs">Read the docs</a>
```

### Tone

```html
<a kuiLink tone="default" href="/settings">Settings</a>
<a kuiLink tone="muted" href="/archive">Archive</a>
<a kuiLink tone="primary" href="/docs">Docs (default)</a>
<a kuiLink tone="success" href="/billing">Upgrade</a>
<a kuiLink tone="warning" href="/billing/past-due">Resolve billing issue</a>
<a kuiLink tone="danger" href="/account/delete">Delete account</a>
```

Tone sets the rest color only. Hover, focus, and active never change color -- only underline
thickness and a focus ring do (see Accessibility).

### Underline

```html
<a kuiLink underline="always" href="/docs">Inline link inside a paragraph of body text</a>
<a kuiLink underline="hover" href="/docs">Standalone link (default)</a>
<a kuiLink underline="none" href="/docs">No underline</a>
```

Use `always` for a link inside a paragraph of running text -- color alone is not a sufficient
signal there. `hover` (the default) is meant for a link that already stands apart from body text
(a card title, a nav item); it still underlines on `:focus-visible`/`:active`, not only mouse
hover, so keyboard and touch users get the same cue.

### Sizes (via composed `[kuiText]`)

```html
<a kuiLink variant="body-lg" href="/docs">body-lg</a>
<a kuiLink variant="body" href="/docs">body (default)</a>
<a kuiLink variant="body-sm" href="/docs">body-sm</a>
<a kuiLink variant="caption" href="/docs">caption</a>
```

`variant` is forwarded straight into the internally-composed `[kuiText]` directive -- `[kuiLink]`
carries no typography scale of its own. Only inline text roles make sense for a link. A link
acting as a heading wraps `[kuiLink]` inside an `<h1>`-`<h6>`, not the reverse -- so heading
semantics never depend on whether the text happens to be a link.

### Icons

```html
<a kuiLink iconStart="download" href="/report.csv">Download report</a>
<a kuiLink iconEnd="arrow-right" href="/updates">All updates</a>
```

`iconStart`/`iconEnd` take a Lucide icon name, rendered through `kui-icon` and decorative (the
link text already carries the meaning).

### External links

```html
<a kuiLink href="https://example.com" target="_blank">External docs</a>
```

`external` defaults to `target() === '_blank'`; set it explicitly to override. When true:

- `rel="noopener noreferrer"` is merged with any `rel` you already set.
- The library's own static external-link chrome glyph fills the `iconEnd` slot, unless you pass
  an explicit `iconEnd` (it is fixed library chrome, not a consumer-chosen icon, so it renders as
  static inline SVG rather than through the async, name-resolved `kui-icon` -- the same treatment
  `kuiDatePicker`'s calendar affix and `kuiTimePicker`'s clock affix get).
- A visually-hidden "(opens in a new tab)" suffix is appended to the accessible name.

### Disabled

```html
<a kuiLink href="/report.csv" disabled>Download (unavailable)</a>
<button kuiLink type="button" disabled>Copy link</button>
```

`<a>` has no native `disabled` attribute, so a disabled anchor gets `aria-disabled="true"` +
`tabIndex="-1"` + a blocked click handler -- the same convention `[kuiButton]` already applies for
`as="a"`. A host `<button>` also gets the native `disabled` attribute.

### JS-driven action, no navigation

```html
<button kuiLink type="button" (click)="copyToClipboard()">Copy link</button>
```

Per MUI's accessibility guidance: a link with no real `href` should render as a `<button>`, not an
`<a>`.

## Inputs

- `tone`: `default | muted | primary | success | warning | danger` (default: `primary`)
- `variant`: `body-lg | body | body-sm | caption` (default: `body`) -- forwarded to the
  internally-composed `[kuiText]`
- `underline`: `always | hover | none` (default: `hover`)
- `iconStart` / `iconEnd`: `KuiIconName | undefined`
- `target` / `rel`: `string | undefined`, reflected onto the host as native attributes
- `external`: `boolean | undefined` (default: `target() === '_blank'`)
- `disabled`: `boolean` (default: `false`)

`href`, native `target`/`rel`, `type`, and `(click)` are plain native attributes/bindings on the
host `<a>`/`<button>` -- no separate `as` input exists in the Angular API.

## Accessibility

- Host is a native `<a href>` or `<button type="button">` -- no custom ARIA role.
- The visible link text is the accessible name; icons are decorative (`aria-hidden` via `kui-icon`
  without a `label`), never the only carrier of meaning.
- `:focus-visible` shows an explicit ring (`box-shadow` on `--kui-link-focus-ring`).
- Disabled: `aria-disabled="true"` + `tabIndex="-1"` + a blocked click handler (`<a>` has no native
  `disabled`; a host `<button>` also gets the native attribute).
- External links get `rel="noopener noreferrer"` and a visually-hidden "(opens in a new tab)" text
  appended to the accessible name, not only a visual icon.
- Color is never the only signal: default/hover/focus/active differ by underline thickness (and
  focus by the ring), not color alone. Avoid `underline="none"` for a link inside a paragraph of
  running text -- there, tone-color-only is not enough.
- No `visited` tone/state -- not found in Taiga `tuiLink`, MUI `Link`, or the kit's own `Text`; not
  a typical pattern in product SaaS/dashboard UI (see Explicitly Not Included).

| Key             | Action                                                                                 |
| --------------- | -------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | Moves focus to/from the link in the page's normal order (disabled links are excluded). |
| Enter           | Activates the link/button (native `<a>`/`<button>` behavior).                          |
| Space           | Activates only when the host is a `<button>` (native `<a>` does not respond to Space). |

## Explicitly Not Included

- A `visited` tone/state -- deliberate; add a `--kui-link-color-visited` token yourself if a
  specific product needs it.
- A typography scale of its own -- `[kuiLink]` composes `[kuiText]` via `hostDirectives` instead
  of duplicating `Text`'s font-size scale.
- A distinct `active` appearance from `hover` -- both use the same thicker underline; the
  real-world difference is duration (cursor lingering vs. a click), not appearance.

## CSS Variables

- `--kui-link-color-default`
- `--kui-link-color-muted`
- `--kui-link-color-primary`
- `--kui-link-color-success`
- `--kui-link-color-warning`
- `--kui-link-color-danger`
- `--kui-link-color-disabled`
- `--kui-link-focus-ring`
- `--kui-link-decoration-thickness-rest`
- `--kui-link-decoration-thickness-active`
- `--kui-link-gap`
- `--kui-link-radius-focus`

## Style Import

Import `@kikita-labs/ui/styles` (which includes `link.css`) once in your application styles.
