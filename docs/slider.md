# Slider

`kuiSlider` applies Kikita UI slider styling and behavior to native range inputs.

## Import

```ts
import { KuiSliderDirective } from '@kikita-labs/ui';
```

## Usage

```html
<input type="range" kuiSlider min="0" max="100" value="60" aria-label="Volume" />

<input type="range" kuiSlider color="success" size="lg" minLabel="0" maxLabel="100" />
```

Use native range input semantics first. Keep an accessible name through `aria-label`, `aria-labelledby`, or a wrapping `kui-field`.

```html
<kui-field label="Volume" hint="Use arrow keys, Home, and End.">
  <input type="range" kuiSlider min="0" max="100" />
</kui-field>
```

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
