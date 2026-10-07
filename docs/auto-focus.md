# Auto Focus

`kuiAutoFocus` moves focus to its host element, or to the first focusable element inside the host,
after the browser has rendered. Use it where the next step is obvious, such as the first field of a
dialog or a code field that has just appeared.

## Import

```ts
import { KuiAutoFocus } from '@kikita-labs/ui';
```

The directive has no styles.

## Basic Usage

```html
<input kuiInput kuiAutoFocus />
```

The attribute without a value means `true`. Bind a value to control it:

```html
<input kuiInput [kuiAutoFocus]="editing()" />
```

Focus moves once after the first render when the value is `true`, and again every time the value
changes from `false` to `true`. A value that stays `true` never pulls focus back.

On a wrapper element the directive focuses the first focusable descendant:

```html
<div kuiAutoFocus>
  <input kuiInput aria-label="Search" />
</div>
```

`kui-otp-input` exposes the same behavior as its own `autoFocus` input and focuses its first cell.

## Rules

- **Browser only.** Nothing runs during server rendering, and the directive never writes the native
  `autofocus` attribute, so the server-rendered page does not move focus before hydration.
- **No `tabindex`.** A target that cannot take focus is skipped. A disabled, hidden or `inert` host
  receives no focus, and neither does a host inside an `inert` subtree.
- **Do not steal.** On first render the request yields when the user has already focused something
  outside the target's dialog or popover. A later `false` to `true` change is an explicit request and
  always focuses.
- **Dialogs and popovers.** While the dialog or popover that holds the target is animating in, focus
  waits for the animation, for at most one second, so the page does not scroll or jump. While
  enabled, the host also carries `cdkFocusInitial`, so the focus trap of `kuiDialog` and `kuiDrawer`
  lands on the same element.
- **Cancel on destroy.** A request that has not run yet is dropped when the host is destroyed.

## API

| Input                       | Type      | Default | Description                                                                              |
| --------------------------- | --------- | ------- | ---------------------------------------------------------------------------------------- |
| `kuiAutoFocus`              | `boolean` | `false` | Enables focus. The attribute without a value is `true`. `false` to `true` focuses again. |
| `kuiAutoFocusPreventScroll` | `boolean` | `false` | Focuses without scrolling the element into view.                                         |

There are no outputs, providers or CSS custom properties. Use one `kuiAutoFocus` element per dialog.

## Accessibility

Automatic focus can disorient screen-reader users: they hear only the label of the focused control and
miss the content before it. On touch devices it can open the on-screen keyboard and scroll the page.
Keep it off by default, use it only where focus on arrival is the expected behavior, and never on page
load of a content page.

Moving focus into a modal dialog is already handled by the dialog's focus trap; `kuiAutoFocus` only
chooses which element inside it. Use it instead of the native `autofocus` attribute, which runs once
per document, cannot repeat, and fires before hydration in a server-rendered page.

iOS Safari may not open the on-screen keyboard for focus that does not come from a user gesture. The
directive does not work around that.
