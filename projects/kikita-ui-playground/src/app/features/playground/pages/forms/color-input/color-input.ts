import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  ColorInputDefault,
  ColorInputSizes,
  ColorInputStates,
  ColorInputValues,
} from './components';

/** Shows the color input's native control, supported sizes, and field states. */
@Component({
  selector: 'app-color-input',
  imports: [
    ColorInputDefault,
    ColorInputSizes,
    ColorInputStates,
    ColorInputValues,
    KuiText,
    TranslocoPipe,
  ],
  templateUrl: './color-input.html',
  styleUrl: './color-input.scss',
})
export class ColorInput {}
