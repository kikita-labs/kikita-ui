# Scrollbar

Kikita provides token-driven native scrollbar styling.

It does not replace native scrolling and does not add JavaScript behavior.

## Import

```ts
import '@kikita-labs/ui/styles/kikita-ui.css';
```

## Basic Usage

For application-wide scrollbar styling, enable the provider option once:

```ts
import { provideKikitaUi } from '@kikita-labs/ui';

export const appConfig = {
  providers: [provideKikitaUi({ scrollbars: 'styled' })],
};
```

This sets `data-kui-scrollbars="styled"` on the document root and styles native scrollbars for application-owned scroll containers.

The default is `scrollbars: 'native'` for application-owned scroll containers. Kikita-owned internal scroll areas, such as dropdown, dialog body, drawer body, and command palette list, still use Kikita scrollbar tokens automatically.

Use `kui-scroll` only for local opt-in when you do not want global application scrollbar styling:

```html
<div class="kui-scroll" tabindex="0" style="max-block-size: 240px; overflow: auto">
  <p>Scrollable content...</p>
  <p>Scrollable content...</p>
  <p>Scrollable content...</p>
</div>
```

Apply the class to the element that actually scrolls. Do not apply it to a child wrapper that has no overflow.

## Accessibility

- The utility keeps native browser scrolling behavior.
- Add `tabindex="0"` on the scrollable element itself so keyboard users can focus and scroll it (WCAG 2.1.1 / axe `scrollable-region-focusable`). CSS alone cannot make an overflow container focusable.
- Do not add ARIA roles only to style a scrollbar.
- Keyboard scrolling, touch scrolling, and assistive-technology behavior remain owned by the native scroll container.
- In forced-colors mode, scrollbar colors fall back to the system implementation.
- Browser and OS scrollbar rendering can differ, especially with overlay scrollbars.

## Custom-track Evaluation

The [article proposal](https://habr.com/ru/articles/1079750/) uses CSS anchor
positioning, scroll timelines, registered custom properties, and animation ranges
to move a visual thumb while the content keeps native overflow scrolling. Its
drag behavior still needs JavaScript. Kikita does not ship that replacement.

An isolated Chromium 149 probe on 2026-09-21 reported support for the proposed
feature set and moved a 50px thumb from 0px to 150px over a 600px vertical
scroll range. Keyboard scrolling and RTL overflow also worked. In
`forced-colors: active`, the probe restored the native scrollbar. This is useful
feasibility evidence for Chromium only; the installed Playwright Firefox and
WebKit binaries were unavailable, so they were not tested.

The proposal depends on [`animation-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-range),
which MDN currently classifies as limited availability rather than Baseline.
Do not hide a native scrollbar or add a public custom-scrollbar API until a
concrete design need, supported-browser matrix, drag and pointer-cancellation
behavior, zoom, nested scrolling, RTL, forced-colors, SSR, and fallback have
all been reviewed. Native token styling remains the current supported contract.

## Tokens

```css
--kui-scrollbar-size
--kui-scrollbar-radius
--kui-scrollbar-track
--kui-scrollbar-thumb-min
--kui-scrollbar-thumb-inset
--kui-color-scrollbar-thumb
--kui-color-scrollbar-thumb-hover
--kui-color-scrollbar-thumb-active
```
