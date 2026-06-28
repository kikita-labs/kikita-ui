# Slider

`kuiSlider` applies Kikita UI slider styling and behavior to native range inputs.

## Import

```ts
import { KuiSliderDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Volume" hint="Use arrow keys, Home, and End.">
  <input type="range" kuiSlider min="0" max="100" value="60" />
</kui-field>
```

Use native range input semantics first. For visible labels and helper text, prefer a wrapping
`kui-field` instead of hand-written labels or description ids.

```html
<input
  type="range"
  kuiSlider
  color="success"
  size="lg"
  minLabel="0"
  maxLabel="100"
  aria-label="Progress"
/>
```

## Signal Forms

Use Angular Signal Forms `[formField]` on the same native range input. Angular owns the native range
value, disabled state, and validation state; `kuiSlider` keeps the generated track/thumb visuals in
sync with the native input.

```html
<kui-field label="Volume" hint="Signal Forms native range binding">
  <input type="range" kuiSlider [formField]="settingsForm.volume" />
</kui-field>
```

Use Angular Signal Forms `min(...)` and `max(...)` validators for range constraints. Do not add
native `min`/`max` attributes to an element that has `[formField]`; Angular binds those native
properties from the schema metadata.

## Inputs

- `color`: `primary | success | danger | neutral`
- `size`: `sm | md | lg`
- `minLabel`: optional label rendered below the start of the track.
- `maxLabel`: optional label rendered below the end of the track.
- `disabled`: mirrors disabled styling on the generated slider wrapper.

## Tooltip

By default, `kuiSlider` shows the current numeric value in a tooltip over the thumb on hover.

If the host also has a non-empty `kuiTooltip`, the static tooltip text wins and the value tooltip is disabled:

```html
<input type="range" kuiSlider kuiTooltip="Playback speed" />
```

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```

Slider styles live in `projects/ui/src/styles/slider.css` and are included through `@kikita-labs/ui/styles`.
