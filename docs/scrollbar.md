# Scrollbar

`kui-scroll` is a token-driven CSS utility for native scroll containers.

It does not replace native scrolling and does not add JavaScript behavior. Use it when a surface owns local overflow and should match Kikita UI scrollbar colors.

## Import

```ts
import '@kikita-labs/ui/styles/kikita-ui.css';
```

## Basic Usage

```html
<div class="kui-scroll" style="max-block-size: 240px; overflow: auto">
  <p>Scrollable content...</p>
  <p>Scrollable content...</p>
  <p>Scrollable content...</p>
</div>
```

Apply the class to the element that actually scrolls. Do not apply it to a child wrapper that has no overflow.

Kikita also applies the same scrollbar treatment to internal scroll containers used by dropdown, dialog, drawer, and command palette primitives.

## Accessibility

- The utility keeps native browser scrolling behavior.
- Do not add ARIA roles only to style a scrollbar.
- Keyboard scrolling, touch scrolling, and assistive-technology behavior remain owned by the native scroll container.
- In forced-colors mode, scrollbar colors fall back to the system implementation.
- Browser and OS scrollbar rendering can differ, especially with overlay scrollbars.

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
