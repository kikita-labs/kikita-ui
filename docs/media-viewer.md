# Media Viewer

A fullscreen photo lightbox: prev/next navigation, a counter, a thumbnail strip, and zoom/pan.
Photos only -- video is intentionally out of scope, per the Claude Design brief for
`06 Media Viewer.dc.html`.

`kuiMediaViewer()` is an imperative opener, the same shape as `kuiDialog()`/`kuiConfirm()`: it
reuses `KuiDialogService` for the portal, backdrop, focus trap, Escape handling, and scroll lock,
the same way `kuiDrawer()` and the Command Palette overlay already do. The panel itself uses
`KuiDialogSize`'s `'fullscreen'` value, added alongside `sm`/`md`/`lg`/`auto` so any dialog content
that needs to own its full layout can request it, not only this component.

Grid layout, per-tile multi-select, and any trigger button are the consumer's own composition
around `kuiMediaViewer()` -- they are not part of its API. It only ever renders the lightbox.

A single photo needs no separate API: pass a one-item `items` array and the counter, Prev/Next,
and thumbnail strip disappear on their own, leaving only zoom and Close -- the same approach
established lightbox libraries (PhotoSwipe, yet-another-react-lightbox) take, one gallery API that
degrades gracefully rather than a duplicate single-photo component.

## Import

```ts
import { kuiMediaViewer } from '@kikita-labs/ui';
import type { KuiMediaViewerItem } from '@kikita-labs/ui';
```

## Usage

```ts
class PhotoGrid {
  private readonly openViewer = kuiMediaViewer();

  protected readonly photos: KuiMediaViewerItem[] = [
    { id: 'p1', src: '/photos/1.jpg', alt: 'Sunset over the bay' },
    { id: 'p2', src: '/photos/2.jpg', alt: 'City skyline at night' },
  ];

  protected openPhotoAt(index: number): void {
    this.openViewer({ items: this.photos, index });
  }
}
```

```html
@for (photo of photos; track photo.id) {
<button type="button" (click)="openPhotoAt($index)">
  <img [src]="photo.src" [alt]="photo.alt" />
</button>
}
```

`kuiMediaViewer()` must be called during an injection context (a component/directive constructor
or field initializer), exactly like `kuiDialog()`/`kuiConfirm()`/`kuiDrawer()`.

### Multi-select composition

A per-tile `input[type=checkbox][kuiCheckbox]` next to (not inside) the cover button is the
consumer's own composition, not a `kuiMediaViewer()` option:

```html
@for (photo of photos; track photo.id) {
<div style="position: relative">
  <button
    type="button"
    (click)="openPhotoAt($index)"
    [attr.aria-label]="'Open photo ' + ($index + 1)"
  >
    <img [src]="photo.src" [alt]="photo.alt" />
  </button>
  <input
    type="checkbox"
    kuiCheckbox
    [checked]="isSelected(photo.id)"
    (change)="toggleSelected(photo.id)"
    aria-label="Select photo"
  />
</div>
}
```

### Single photo, no gallery chrome

```ts
this.openViewer({ items: [{ src: '/photos/1.jpg', alt: 'Sunset over the bay' }] });
```

Just zoom and Close -- no counter, no Prev/Next, no thumbnail strip. `id` is optional here too
(defaults to `src`).

### Live index

```ts
this.openViewer({
  items: this.photos,
  index: 0,
  onIndexChange: (index) => this.lastViewedIndex.set(index),
});
```

`onIndexChange` fires once on open (with the clamped initial index) and again on every
prev/next/thumbnail/keyboard navigation while the lightbox stays open.

## API

`kuiMediaViewer(): (data: KuiMediaViewerData) => Observable<void | undefined>`

`KuiMediaViewerData`:

| Field           | Type                            | Default          | Description                                                         |
| --------------- | ------------------------------- | ---------------- | ------------------------------------------------------------------- |
| `items`         | `readonly KuiMediaViewerItem[]` | --               | Photos to browse. Required, must contain at least one item.         |
| `index`         | `number`                        | `0`              | Index to open on. Clamped to the valid range.                       |
| `maxZoom`       | `number`                        | `3`              | Upper zoom bound.                                                   |
| `zoomStep`      | `number`                        | `0.5`            | Zoom increment per Zoom in/out click.                               |
| `ariaLabel`     | `string`                        | `'Photo viewer'` | Base accessible name; "photo N of total" is appended automatically. |
| `onIndexChange` | `(index: number) => void`       | --               | Called on open and on every navigation.                             |

`KuiMediaViewerItem`:

| Field | Type      | Description                                                                                                                                                                                                                           |
| ----- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`  | `string?` | Stable identifier, used for tracking and thumb keys. Optional -- defaults to `src` when omitted (a URL is already a natural stable key for a photo). Pass an explicit `id` only when two items can legitimately share the same `src`. |
| `src` | `string`  | Image URL. The viewer never fetches or transforms it.                                                                                                                                                                                 |
| `alt` | `string`  | Accessible/alt text for the photo. Required, not defaulted to `''` -- pass `alt: ''` explicitly for a genuinely decorative photo.                                                                                                     |

The returned `Observable` completes when the lightbox closes (Close button, Escape, or backdrop
click); it carries no result value.

## Pointer, Wheel, and Touch

- Dragging a zoomed-in (`zoom > 1`) photo pans it. Panning stops the moment the pointer leaves the
  lightbox (checked against the whole viewer, not just the photo frame), and always ends cleanly
  on pointer up/cancel even if released outside the browser window (via
  [`setPointerCapture`](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture)).
- The photo itself is not natively draggable/selectable (`draggable="false"` plus
  `user-select: none`), so a pan drag never turns into the browser's own "drag this image out" or
  text-selection gesture.
- Mouse wheel / trackpad zooms in/out by one `zoomStep` per wheel event (scroll up zooms in). A
  trackpad two-finger pinch is reported by the browser as a wheel event with `ctrlKey: true`, so it
  is handled the same way.
- A touchscreen two-finger pinch zooms continuously (not stepped), scaling from the zoom level and
  finger distance at the moment the second finger touched down.

## Accessibility

- The panel is `role="dialog"` + `aria-modal="true"` (from `KuiDialogService`), `aria-labelledby`
  pointing at a visually-hidden `<h2>` reading "Photo viewer, photo N of total" for a gallery, or
  just "Photo viewer" (the `ariaLabel` alone) for a single photo.
- Focus trap, focus restore to the trigger element on close, and page scroll lock come from
  `KuiDialogService`, not reimplemented here.
- The counter is `aria-live="polite"`, announced on navigation without reopening the dialog. Not
  rendered at all for a single photo -- "1 / 1" carries no information.
- Close/Prev/Next/Zoom in/Zoom out are `button[kuiIconButton]`; Prev/Next/Zoom in/Zoom out get
  native `disabled` at their bounds instead of only a dimmed appearance. Prev/Next are not rendered
  at all for a single photo, rather than shown permanently disabled.
- Every thumbnail is a real `<button>` with an `aria-label` ("Go to photo N of total") and
  `aria-current="true"` on the currently viewed one.

| Key             | Action                                                             |
| --------------- | ------------------------------------------------------------------ |
| Tab / Shift+Tab | Cycles focus inside the lightbox (trap from `KuiDialogService`).   |
| Escape          | Closes the lightbox.                                               |
| Left / Right    | Previous / next photo. Does not wrap -- bounds disable the button. |
| Home / End      | First / last photo.                                                |
| Enter / Space   | Activates the focused button (native).                             |

## Explicitly Not Included

- Video. Only photos are supported.
- A `selectable`/multi-select prop on the component itself -- grid layout and per-tile selection
  are the consumer's own composition (see Usage above).
- A natural-image-size-aware pan clamp -- panning while zoomed uses a fixed offset budget per zoom
  step, not the photo's actual rendered dimensions.
- Range/gallery-group linking across multiple `kuiMediaViewer()` calls -- each open is independent.

## Style Import

Import `@kikita-labs/ui/styles` (which includes `media-viewer.css`) once in your application
styles.
