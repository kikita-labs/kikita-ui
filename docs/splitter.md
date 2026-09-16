# Splitter

Draggable multi-pane layout: two or more panes separated by keyboard- and pointer-resizable
gutters, following the W3C ARIA APG Window Splitter Pattern. New pattern (not among the kit's
pre-existing primitives), built from Claude Design spec `08 Splitter.dc.html`.

Gutters are not written by the consumer -- `kui-splitter` creates one internal gutter component
per pair of adjacent panes and inserts it between their native elements with `Renderer2`
(`ViewContainerRef.createComponent` + `insertBefore`), the same technique real-world libraries like
angular-split use: Angular's content projection has no declarative way to interleave generated
elements between individually projected sibling components. Pane sizes are percentages of the
splitter's own immediate container, computed via `calc()` against the gutters' fixed pixel width so
panes and gutters always sum to exactly 100% with no drift; nesting one splitter inside another
pane needs no special API since each splitter only ever measures its own container.

## Import

```ts
import { KuiSplitterComponent, KuiSplitterPaneComponent } from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Usage

```html
<kui-splitter orientation="horizontal" (sizesChange)="onResize($event)">
  <kui-splitter-pane size="30" [minSize]="15" [collapsible]="true">
    <app-file-tree />
  </kui-splitter-pane>
  <kui-splitter-pane size="70" [minSize]="30">
    <app-editor />
  </kui-splitter-pane>
</kui-splitter>
```

```ts
protected onResize(sizes: readonly number[]): void {
  // sizes[i] is the percentage width/height of pane i
}
```

`size` on `kui-splitter-pane` is only the initial/requested share -- `kui-splitter` owns the live
size from then on (drag and keyboard both write back into it). Panes without an explicit `size`
split the remaining space evenly among themselves, the same way flex items without an explicit
basis share leftover space.

## Orientation

```html
<kui-splitter orientation="vertical">...</kui-splitter>
```

Defaults to `horizontal` (panes side by side, a vertical gutter line). `vertical` stacks panes
top-to-bottom with a horizontal gutter line.

## minSize

```html
<kui-splitter-pane [minSize]="20">...</kui-splitter-pane>
```

Percentage floor for a pane, defaults to `10`. Drag and keyboard resizing both clamp to it --
enough to stop an accidental drag or keyboard step from collapsing a pane to nothing; override only
when a different floor is actually needed.

## Collapsible panes

```html
<kui-splitter>
  <kui-splitter-pane [collapsible]="true">...</kui-splitter-pane>
  <kui-splitter-pane>...</kui-splitter-pane>
</kui-splitter>
```

Only meaningful on the **first or last** pane in the row -- collapsing a middle pane is not
supported (matches the design spec's own scope cut; a middle pane's `collapsible` flag is silently
ignored). A collapsible edge pane gets a small one-touch button on its adjacent gutter that toggles
it between its `minSize` and its size before collapsing; `Enter` on that gutter does the same thing.

## Multiple panes

```html
<kui-splitter>
  <kui-splitter-pane [size]="20">...</kui-splitter-pane>
  <kui-splitter-pane>...</kui-splitter-pane>
  <kui-splitter-pane>...</kui-splitter-pane>
</kui-splitter>
```

Any number of panes works -- `kui-splitter` renders `panes.length - 1` gutters, one between each
adjacent pair. Dragging or keyboard-resizing a gutter only ever affects the two panes touching it,
clamped by each one's own `minSize` (matches the design spec's own scope cut; there is no cascading
resize across more than two panes from a single gutter).

## Nested splitters

```html
<kui-splitter orientation="vertical">
  <kui-splitter-pane>
    <kui-splitter orientation="horizontal">
      <kui-splitter-pane size="25">...</kui-splitter-pane>
      <kui-splitter-pane size="75">...</kui-splitter-pane>
    </kui-splitter>
  </kui-splitter-pane>
  <kui-splitter-pane [minSize]="10">...</kui-splitter-pane>
</kui-splitter>
```

No special API -- a `kui-splitter` inside a `kui-splitter-pane` just measures its own immediate
container, the typical IDE-layout composition (e.g. an outer vertical split for an editor/terminal,
with an inner horizontal split for a file tree/editor).

## Disabled

```html
<kui-splitter [disabled]="true">...</kui-splitter>
```

Every gutter gets the native-equivalent `tabIndex="-1"` and `aria-disabled="true"`, and ignores both
drag and keyboard input -- not just a dimmed cursor. Pane content itself is unaffected (still
interactive); only the resize affordance is disabled.

## API

### `kui-splitter`

| Input         | Type                         | Default        | Description            |
| ------------- | ---------------------------- | -------------- | ---------------------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Pane layout direction. |
| `disabled`    | `boolean`                    | `false`        | Disables every gutter. |

| Output        | Payload             | Description                                                      |
| ------------- | ------------------- | ---------------------------------------------------------------- |
| `sizesChange` | `readonly number[]` | Emitted with the full sizes array on every drag/keyboard resize. |

### `kui-splitter-pane`

| Input         | Type                  | Default | Description                                                                       |
| ------------- | --------------------- | ------- | --------------------------------------------------------------------------------- |
| `size`        | `number \| undefined` | --      | Initial/requested share, as a percentage. Optional -- see Usage above.            |
| `minSize`     | `number`              | `10`    | Minimum share, as a percentage.                                                   |
| `collapsible` | `boolean`             | `false` | Renders a one-touch collapse button on the adjacent gutter. First/last pane only. |

`kui-splitter-pane` also exposes `currentSize` (live percentage, a `Signal<number>`), `collapsed`
(a `Signal<boolean>`), and `toggleCollapse()` for template-ref access (`#pane="..."` isn't needed --
inject or query the component directly if you need these outside a template).

## Accessibility

- Each gutter is `role="separator"`, focusable (`tabIndex="0"` unless `disabled`), following the
  W3C ARIA APG Window Splitter Pattern.
- `aria-orientation` describes the gutter's own line, not the panes' layout: panes laid out
  horizontally have a _vertical_ line, so `aria-orientation="vertical"`, and vice versa.
- `aria-valuenow`/`aria-valuemin`/`aria-valuemax` track the size of the pane _before_ the gutter in
  DOM order, recalculated on every resize from the same value that drives the visual `flex-basis` --
  they can never drift out of sync with what's on screen.
- `aria-controls` points at the id of that same before-pane.
- The one-touch collapse button has its own `aria-label` ("Collapse pane" / "Expand pane"), not
  relying on the chevron icon alone.
- `disabled` sets `aria-disabled="true"` and `tabIndex="-1"`, removing the gutter from the tab
  order, not just dimming it.

| Key                                      | Action                                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Tab` / `Shift+Tab`                      | Focus each gutter in turn.                                                                                |
| `←`/`→` (horizontal), `↑`/`↓` (vertical) | Resize the before-pane by 2%. `Shift` for a 10% step.                                                     |
| `Home` / `End`                           | Collapse the before-pane to its `minSize` / expand it to the max (bounded by the after-pane's `minSize`). |
| `Enter`                                  | Toggle collapse on the adjacent pane -- only when it is `collapsible`.                                    |
| `Escape`                                 | Cancel an active drag, reverting to the sizes from before it started.                                     |

## CSS custom properties

| Token                                                                            | Default                                                                                                       | Description                                   |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `--kui-splitter-pane-bg` / `-pane-border`                                        | `--kui-color-surface` / `--kui-color-border`                                                                  | Container background/border.                  |
| `--kui-splitter-radius`                                                          | `--kui-radius-md`                                                                                             | Container corner radius.                      |
| `--kui-splitter-gutter-size`                                                     | `--kui-space-2`                                                                                               | Width/height of the interactive gutter strip. |
| `--kui-splitter-gutter-line` / `-line-hover` / `-line-active` / `-line-disabled` | `--kui-color-border` / `--kui-color-border-strong` / `--kui-color-primary-fill` / `--kui-color-border-subtle` | Gutter line color by state.                   |
| `--kui-splitter-thumb-bg` / `-thumb-bg-hover` / `-thumb-bg-active`               | `--kui-color-border-strong` / `--kui-color-primary-fill-hover` / `--kui-color-primary-fill-active`            | Default grip color by state.                  |
| `--kui-splitter-collapse-btn-bg` / `-collapse-btn-fg`                            | `--kui-splitter-thumb-bg` / `--kui-color-surface`                                                             | One-touch collapse button.                    |
| `--kui-splitter-focus-ring`                                                      | `--kui-color-primary-focus-ring`                                                                              | Focus-visible ring on a gutter.               |

## Known gaps

- No `[kuiSplitterThumb]` custom-thumb projection yet -- the design spec describes replacing the
  default grip/chevron with arbitrary projected content (e.g. a `kuiIconButton`), which would need
  relocating a DOM node from inside a pane into its adjacent gutter. Deferred; only the default
  grip and one-touch chevron button are implemented in this iteration.
- No size persistence between sessions (an equivalent to PrimeNG's `stateKey`) -- not requested for
  this iteration.
- The interactive gutter strip is 8px, thinner than the 44px mobile touch-target guidance --
  intentional: this is a desktop cursor-driven control across the whole researched field (VSCode,
  PrimeNG, Spectrum), not a mobile touch control.
- Not reviewed in a real browser yet; the automated document-overflow check, committed visual
  regression baselines, and a formal assistive-technology pass are still pending, same as other
  recently added primitives.
