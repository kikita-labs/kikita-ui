# Group

`kuiGroup` groups adjacent Kikita UI controls and can collapse their shared borders.

## Import

```ts
import { KuiGroupDirective } from '@kikita-labs/ui';
```

## Usage

```html
<div kuiGroup collapsed>
  <button kuiButton appearance="outline">One</button>
  <button kuiButton appearance="outline">Two</button>
  <button kuiIconButton appearance="outline" aria-label="More">
    <kui-icon name="more" />
  </button>
</div>
```

## Inputs

- `orientation`: `horizontal | vertical`
- `size`: `xs | sm | md | lg`
- `collapsed`: collapses adjacent borders
- `rounded`: keeps outer corners rounded when collapsed

## With `kui-field`

`kui-field` can sit inside a `kuiGroup` alongside buttons and inputs, with or without a `label`,
`hint`, or `error` -- in any combination:

```html
<div kuiGroup collapsed>
  <button kuiIconButton icon="play" type="button" aria-label="Play"></button>
  <button kuiIconButton icon="x" type="button" aria-label="Remove"></button>
  <kui-field>
    <input kuiInput placeholder="Search" />
  </kui-field>
</div>

<div kuiGroup>
  <kui-field label="Email" hint="We only use this for delivery notices">
    <input kuiInput type="email" placeholder="you@example.com" />
  </kui-field>
  <button kuiButton type="button">Notify me</button>
</div>
```

A horizontal `kuiGroup` lays its direct children out on a 3-row grid (label row / control row /
message row) instead of a flex row. Plain buttons and inputs are pinned to the middle (control)
row. A `kui-field` child becomes a CSS subgrid spanning all 3 rows, so its own label/control/
message rows resolve against the group's shared row tracks instead of sizing independently. The
practical effect: a sibling button's control always lines up with a field's control, no matter
which of label/hint/error that field renders -- the group's label-row and message-row tracks are
simply `0px` tall in the button's column since it has no content there, and grow to match whatever
the field puts in them.

`collapsed` still merges the field's control border into an adjacent bordered control the same way
it does for a bare `input[kuiInput]`: the group reaches through the field host into its projected
`.kui-input` for radius stripping/restoring. A label sitting above the control is not part of the
shared border -- only the control row participates in `collapsed` merging.

Vertical groups do not use the subgrid layout (label/control/message rows have no meaningful
mapping onto a column-stacked group), so a labeled/hinted/error `kui-field` inside a vertical group
falls back to the field's own row sizing -- fine, since vertical groups do not need cross-axis
(inline-size) row alignment between siblings the way horizontal groups need block-size alignment.

## Sizing Assumption

`kuiGroup` does not force a uniform height on its children; it relies on every direct child already
being the same control height. Pass a matching `size` to every grouped control (or rely on the
group's `size` input, which sets `--kui-btn-height`/`--kui-input-height` for children that read
those variables) so `align-items: stretch` has nothing to reconcile. Mixing an explicit `size` on
one child with a different group size is a consumer choice, not something the group corrects for,
and produces visible top-alignment instead of vertical centering.
