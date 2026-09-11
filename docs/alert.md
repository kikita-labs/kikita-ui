# Alert

Inline notification embedded in the page content flow. Unlike `kuiToast()`, `kui-alert` does not
float above the interface, does not self-dismiss on a timer, and does not require a
`document.body` region -- it renders directly next to the content it relates to.

## Import

```ts
import { KuiAlertComponent } from '@kikita-labs/ui';

// Only if you need custom content -- see "Custom content" below.
import {
  KuiAlertActionsDirective,
  KuiAlertIconDirective,
  KuiAlertMessageDirective,
} from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Usage

```html
<kui-alert
  appearance="warning"
  title="Session expiring"
  message="Your access token expires in 3 days -- renew it in advance."
  actionLabel="Renew"
  (action)="renewSession()"
  (closed)="dismissed.set(true)"
/>
```

`kui-alert` is a controlled component: it never removes itself from the DOM. `(closed)` only
notifies the consumer when the close button is clicked, the same pattern `[kuiChip]`'s `(removed)`
uses -- conditionally render the alert (e.g. `@if (!dismissed())`) to actually hide it.

```ts
protected readonly dismissed = signal(false);
```

```html
@if (!dismissed()) {
<kui-alert message="Draft saved." (closed)="dismissed.set(true)" />
}
```

At least one of `title`/`message`/a projected `[kuiAlertMessage]` should be set.

## Custom content

`title`/`message`/`actionLabel` cover the common plain-text case. For richer content, project
`[kuiAlertTitle]`, `[kuiAlertIcon]`, `[kuiAlertMessage]`, or `[kuiAlertActions]` instead -- the
same shorthand-input-or-projected-content pattern `kui-empty-state` uses for its icon/actions
slots. A projected slot always takes over its area entirely; it is not merged with the matching
input, and the matching input is ignored when a slot is projected.

```html
<kui-alert appearance="danger" (closed)="dismissed.set(true)">
  <kui-icon kuiAlertIcon name="cloud-off" />
  <span kuiAlertTitle>Upload failed <span kuiBadge appearance="danger">retrying</span></span>
  <p kuiAlertMessage>Check your connection and <a href="/retry">try again</a>.</p>
  <div kuiAlertActions>
    <button kuiButton shape="ghost" size="xs" (click)="retry()">Retry</button>
    <button kuiButton shape="ghost" size="xs" (click)="dismiss()">Dismiss</button>
  </div>
</kui-alert>
```

- `[kuiAlertTitle]` replaces the plain `title` string with arbitrary markup (a badge, an icon,
  inline formatting) when the title needs more than plain text.
- `[kuiAlertIcon]` replaces the built-in severity icon. Unlike the built-in icon (hidden for
  `neutral` and governed by `showIcon`), a projected icon always renders -- an explicit custom icon
  is always intentional. It inherits `--kui-alert-icon-color` via an inline style, the same way the
  built-in icon does.
- `[kuiAlertMessage]` replaces the plain `message` string with arbitrary markup (links, lists,
  inline formatting). `title` still renders normally alongside it.
- `[kuiAlertActions]` replaces the single ghost `actionLabel` button with one or more custom
  controls (multiple buttons, a link, a non-`kuiButton` control). Buttons using `kuiButton` inside
  it automatically pick up the same appearance-tinted ghost color and hover state as the built-in
  action button.

## Message-only

```html
<kui-alert message="This is how Alert renders with only message set." />
```

## Banner variant

```html
<kui-alert appearance="info" banner message="We updated the terms of service." />
```

`banner` stretches the alert to the full width of its container and removes the corner radius --
use it for a system-wide message that sits above the page content, not for an alert that lives
next to a specific piece of content. It also drops the side/top border down to a single
`border-bottom` seam (it reads as a bar, not a boxed card); stacking several banners in a column
gives each one a shared 1px line between them.

## API

| Input         | Type                 | Default                | Description                                                                                                                                                            |
| ------------- | -------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appearance`  | `KuiAlertAppearance` | `'neutral'`            | Semantic type. Same five values as `KuiToastAppearance`.                                                                                                               |
| `shape`       | `KuiAlertShape`      | `'soft'`               | Visual weight. Uses the `KuiButtonShape` vocabulary (`soft`/`outline`/`solid`).                                                                                        |
| `size`        | `KuiAlertSize`       | `'md'`                 | Padding/gap density.                                                                                                                                                   |
| `banner`      | `boolean`            | `false`                | Stretches the alert full-width and removes corner radius.                                                                                                              |
| `title`       | `string`             | -                      | Optional single-line heading. Ignored when `[kuiAlertTitle]` is projected.                                                                                             |
| `message`     | `string`             | -                      | Optional supporting text below the title. Ignored when `[kuiAlertMessage]` is projected.                                                                               |
| `showIcon`    | `boolean`            | `true`                 | Shows the built-in appearance icon. `neutral` never shows one regardless of this value. Ignored when `[kuiAlertIcon]` is projected -- a projected icon always renders. |
| `closable`    | `boolean`            | `true`                 | Shows the close button and enables `(closed)`.                                                                                                                         |
| `closeLabel`  | `string`             | `'Close notification'` | Accessible label for the close button.                                                                                                                                 |
| `actionLabel` | `string`             | -                      | Label for the inline ghost action button. Ignored when `[kuiAlertActions]` is projected.                                                                               |

| Output   | Payload | Description                                                                               |
| -------- | ------- | ----------------------------------------------------------------------------------------- |
| `action` | `void`  | Fires when the action button is clicked. Not emitted for a projected `[kuiAlertActions]`. |
| `closed` | `void`  | Fires when the close button is clicked. Does not remove the alert.                        |

## Appearances and icons

Icon mapping is reused from `kuiToast()` so Alert and Toast speak the same visual language:

| Value     | Icon (Lucide)    |
| --------- | ---------------- |
| `neutral` | none             |
| `info`    | `info`           |
| `success` | `circle-check`   |
| `warning` | `triangle-alert` |
| `danger`  | `circle-x`       |

The severity icon and the close glyph render as inline `<svg>` built from
`kui-chrome-icon-paths.util` -- the same synchronous, SSR-safe pattern `kuiToast()` uses for its
own chrome -- rather than the async, name-resolved `kui-icon`. The glyph shapes match their Lucide
namesakes; nothing depends on a network fetch or waits past hydration to appear.

The built-in icon box is 16px on `size="sm"` and 18px on `size="md"`.

The inline ghost action button reads in the appearance's own `--kui-color-{appearance}-soft-text`
tone instead of the generic ghost color (overridden to `on-fill` on `shape="solid"` for contrast),
so it visually matches the alert it belongs to.

## Shapes

`shape` reuses `KuiButtonShape`'s naming, restricted to the three that make sense for a static
surface:

- `soft` (default) -- tinted background, tinted border, saturated icon.
- `outline` -- transparent background, saturated border, saturated icon.
- `solid` -- saturated fill background, `on-fill` text/icon/action for contrast. The message uses
  the same `on-fill` tone as the title instead of a dimmed secondary tone, to guarantee 4.5:1
  contrast on a saturated fill.

`neutral` does not have its own semantic color scale; it maps to the surface/border tokens instead
of `{appearance}-soft-*`:

| Shape     | `neutral` background         | `neutral` border            |
| --------- | ---------------------------- | --------------------------- |
| `soft`    | `--kui-color-surface-sunken` | `--kui-color-border`        |
| `outline` | `transparent`                | `--kui-color-border-strong` |
| `solid`   | `--kui-color-border-strong`  | `transparent`               |

## Accessibility

- `role="alert"` + `aria-live="assertive"` + `aria-atomic="true"` only for `appearance="danger"`
  (genuinely urgent). Every other appearance uses `role="status"` + `aria-live="polite"` +
  `aria-atomic="true"` -- the same split `kuiToast()` uses, so a screen reader is not interrupted
  by routine info/success/warning alerts.
- `kui-alert` itself is not in the tab order; only its real controls (action, close) are
  focusable.
- The close button is a `kuiIconButton` with a required accessible name (`closeLabel`, default
  `"Close notification"`), never an unlabeled icon.
- Severity is never color-only: `info`/`success`/`warning`/`danger` always pair an icon with text;
  `neutral` has no icon because it carries no severity meaning.
- `Escape` does not close `kui-alert` -- it is a static region, not an overlay.

## CSS custom properties

| Token                    | Default (varies by appearance x shape x size)                    | Description                      |
| ------------------------ | ---------------------------------------------------------------- | -------------------------------- |
| `--kui-alert-bg`         | `--kui-color-{appearance}-soft-bg` / `-fill` / `transparent`     | Background, depends on `shape`.  |
| `--kui-alert-border`     | `--kui-color-{appearance}-soft-border` / `-fill` / `transparent` | Border, depends on `shape`.      |
| `--kui-alert-icon-color` | `--kui-color-{appearance}-fill`                                  | Icon color for `soft`/`outline`. |
| `--kui-alert-fg`         | `--kui-color-on-fill` on `solid`, unset otherwise                | Text color override for `solid`. |
| `--kui-alert-radius`     | `--kui-radius-md` (`--kui-radius-none` when `banner`)            | Corner radius.                   |
| `--kui-alert-padding-y`  | `--kui-space-3` (`--kui-space-2` on `sm`)                        | Vertical padding.                |
| `--kui-alert-padding-x`  | `--kui-space-4` (`--kui-space-3` on `sm`)                        | Horizontal padding.              |
| `--kui-alert-gap`        | `--kui-space-3` (`--kui-space-2` on `sm`)                        | Gap between icon / body / close. |
| `--kui-alert-message-fg` | `--kui-color-text-secondary` (`on-fill` on `solid`)              | Message text color.              |

## Known gaps

- `title` is intentionally optional, unlike `kuiToast()` where it is required -- justified by
  message-only usage in PrimeNG Messages and NG-ZORRO Alert. See Claude Design spec
  `01 Alert.dc.html`'s open questions for the full rationale.
- The close button's hit target is 28px (`kuiIconButton size="xs"`), below the 44px platform
  recommendation. This is an inherited kit limitation already present in `kuiToast()`, not
  something this component introduces or fixes.
- `/alert` has been reviewed in the browser at desktop width in both light and dark theme with no
  console errors; committed visual regression baselines and a formal assistive-technology review
  are not yet run.
