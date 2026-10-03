# Structural Icons

Structural icons are the small glyphs a component draws for itself: the cross on a dialog, the
chevron on a select, the status mark on an alert. They are not the icons you pass to `kui-icon` by
name. They never touch the icon registry or the network, they render on the server, and you can
replace them for the whole app or for one subtree without changing a template.

```ts
import { kuiProvideDefaults, provideKikitaUi } from '@kikita-labs/ui';
import type { KuiIconGlyph } from '@kikita-labs/ui';

const CIRCLE_X: KuiIconGlyph = {
  node: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['path', { d: 'm15 9-6 6' }],
    ['path', { d: 'm9 9 6 6' }],
  ],
};

// Whole app
provideKikitaUi({ defaults: { icons: { close: CIRCLE_X, remove: CIRCLE_X } } });

// One subtree
providers: [kuiProvideDefaults({ icons: { close: CIRCLE_X } })];
```

## Precedence

```text
defaults.<component>.<slot>Icon > defaults.icons.<role> > built-in glyph
```

A role changes every component that has no more specific override. A component slot changes only
that component. Levels merge per key like every other default (see [DI Defaults](di-defaults.md)),
so a nested level overrides only the roles it names. Values may be plain glyphs or signals.

## Roles

`defaults.icons` takes one glyph per role. Roles are named for what the icon does, not for its
shape: one cross is `close` on a dialog, `remove` on a chip and `clear` in a field.

| Role                                                           | Used by                                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `close`                                                        | Dialog, Drawer, Media Viewer, Toast and Alert close buttons                                                   |
| `remove`                                                       | Chip remove button (also the chips of a multiple Select), File Upload remove button                           |
| `clear`                                                        | Clear button of Select, Combobox, Date Picker, Time Picker; Command Palette search clear                      |
| `pickerChevron`                                                | Options toggle of Select, Combobox, Date Picker, Time Picker, Color Input                                     |
| `previous`                                                     | Previous page, month, slide or tab group (Pagination, Calendar, Calendar Range, Carousel, Tabs, Media Viewer) |
| `next`                                                         | Next page, month, slide or tab group (same components)                                                        |
| `first`, `last`                                                | First and last page buttons of Pagination                                                                     |
| `disclosure`                                                   | Expand control of Accordion items and Tree nodes (rotation stays CSS)                                         |
| `separator`                                                    | Breadcrumb separator                                                                                          |
| `check`                                                        | Completed Stepper step, finished File Upload item                                                             |
| `statusInfo`, `statusSuccess`, `statusWarning`, `statusDanger` | Status mark of Alert and Toast; the warning mark of a non-default Confirm dialog                              |
| `externalLink`                                                 | Mark after an external `[kuiLink]`                                                                            |

The names are direction-neutral on purpose (`previous`, not `left`), so a role stays correct if a
layout is ever mirrored. Right-to-left layouts are not supported in v2.

## Component slots

A component slot beats the role. Slots live in the component's own options interface, so a typo
is a type error.

| Key                                              | Slots                                               |
| ------------------------------------------------ | --------------------------------------------------- |
| `dialog`, `drawer`                               | `closeIcon`                                         |
| `alert`, `toast`                                 | `closeIcon`                                         |
| `chip`                                           | `removeIcon`                                        |
| `fileUpload`                                     | `removeIcon`                                        |
| `select`, `combobox`, `datePicker`, `timePicker` | `chevronIcon`, `clearIcon`                          |
| `colorInput`                                     | `chevronIcon`                                       |
| `calendar`, `calendarRange`                      | `previousIcon`, `nextIcon`                          |
| `carousel`, `tabs`                               | `previousIcon`, `nextIcon`                          |
| `pagination`                                     | `firstIcon`, `previousIcon`, `nextIcon`, `lastIcon` |
| `accordion`, `tree`                              | `disclosureIcon`                                    |
| `breadcrumbs`                                    | `separatorIcon`                                     |
| `link`                                           | `externalIcon`                                      |

The chips inside a multiple Select read `defaults.chip.removeIcon`, then `defaults.icons.remove`.

Glyphs that are specific to one component and have no role (calendar, clock, search and zoom marks,
play and pause, copy, file and folder, upload) are drawn by the same renderer, so they follow the
stroke tokens below, but they cannot be replaced yet. Ask for a slot when you need one.

Two glyph sets are outside this system: the plus, minus and chevron steppers of `kuiNumberInput` (drawn on a 12 by 12 grid by the directive) and the silhouette placeholder of `kui-avatar` (a filled shape). Charts draw data, not icons.

## Glyph data

An icon is plain data, not markup:

```ts
interface KuiIconGlyph {
  readonly node: readonly (readonly [
    tag: string,
    attributes: Record<string, string | number | undefined>,
  ])[];
  readonly viewBox?: string; // default '0 0 24 24'
}
```

The layout is the icon-node format of [Lucide](https://lucide.dev), so an icon from `@lucide/icons`
(or the `icon-nodes.json` of `lucide-static`) can be used as is. Hand-drawn icons and other sets
work the same way: draw them with strokes on a 24 by 24 grid, or set `viewBox`.

| Rule             | Behavior                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Elements         | `path`, `line`, `polyline`, `polygon`, `circle`, `ellipse`, `rect`. Any other element invalidates the glyph.                                                                                                                                                                                                                                                |
| Attributes       | Geometry (`d`, `cx`, `cy`, `r`, `rx`, `ry`, `x`, `y`, `x1`, `y1`, `x2`, `y2`, `width`, `height`, `points`) and paint (`fill`, `fill-opacity`, `fill-rule`, `clip-rule`, `stroke`, `stroke-opacity`, `stroke-linecap`, `stroke-linejoin`, `stroke-miterlimit`, `stroke-dasharray`, `stroke-dashoffset`, `opacity`, `transform`). Everything else is ignored. |
| Values           | Strings and numbers only. Values containing `url(`, `<`, `>` or `javascript:` are ignored.                                                                                                                                                                                                                                                                  |
| Line weight      | `stroke-width` and `vector-effect` are not accepted; the tokens below own them.                                                                                                                                                                                                                                                                             |
| Filled shapes    | Set `fill` and `stroke: 'none'` on the element (the built-in play glyph does).                                                                                                                                                                                                                                                                              |
| Invalid override | Ignored, and the next level of the precedence chain is used. In development mode the first use of an invalid glyph logs a warning.                                                                                                                                                                                                                          |

Colour always follows `currentColor`, so a glyph picks up the surrounding text colour, hover and
disabled states and the forced-colors palette.

## Stroke width

Two public CSS custom properties control the line of structural icons and of stroke-based
`kui-icon` content. Set them on `:root` or on any subtree.

| Token                      | Values                                 | Effect                                                                                                                                                    |
| -------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--kui-icon-stroke-width`  | A number in glyph-grid units           | Built-in glyphs default to the weight of their call site (between 1.5 and 2.5); content icons keep the weight of their own markup until the token is set. |
| `--kui-icon-vector-effect` | `none` (default), `non-scaling-stroke` | `non-scaling-stroke` keeps the stroke the same number of pixels at any icon size.                                                                         |

```css
:root {
  --kui-icon-stroke-width: 1.5; /* thinner icons everywhere */
}
```

```html
<kui-icon name="settings" size="96" [strokeWidth]="1.5" absoluteStrokeWidth />
```

`kui-icon` exposes both through `strokeWidth` and `absoluteStrokeWidth` (names follow Lucide). They
only set the tokens on the host, so an ancestor can set them too. Only stroke-based drawings
respond: filled shapes, gradients and markup with an inline `style="stroke-width: …"` do not.

A scaling stroke is the default because a constant pixel stroke makes small icons blurry on some
screens. There is no automatic per-size adjustment.

## Accessibility

- Structural icons are decorative: `aria-hidden="true"`, `focusable="false"`. The accessible name
  belongs to the owning control (`aria-label` on the close button, the visible text of the chip),
  and an override never changes it.
- Glyphs use `currentColor`, so they are visible in forced-colors mode with the system text colour.
  Icons drawn with a CSS `mask-image` and `background: currentColor` disappear in Chromium in that
  mode; this renderer draws real SVG for that reason.

## Security

A glyph is drawn through a fixed list of elements and attributes, never through `innerHTML`, and
Angular's sanitizer bypass is not involved. A glyph can therefore come from any source. The icons
that `kui-icon` fetches by name (the default Lucide set) are converted to the same data with the same
rules before they are drawn; see [Icon](icon.md).

## Server rendering

Glyphs are plain template output: the server HTML already contains the icon, and hydration reuses
it. The chip's generated remove button and the Color Input toggle are built in the browser only, as
before, and follow the same defaults.

## Not supported

- Per-instance icon inputs on components: use a subtree and `kuiProvideDefaults`.
- Icon fonts, sprite sheets and CSS `mask-image` icons.
- `<g>`, gradients, `<use>`, `<image>`, filters and text inside a glyph.
- Render functions or component templates as an override value.
