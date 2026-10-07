import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  InputAutoFocus,
  InputDefault,
  InputExplicitId,
  InputSizes,
  InputStates,
  InputTypes,
  InputValidation,
} from './components';

/** Shows native input defaults, an explicit id, sizes, states, types, auto focus, and Signal Forms integration. */
@Component({
  selector: 'app-input',
  imports: [
    InputAutoFocus,
    InputDefault,
    InputExplicitId,
    InputSizes,
    InputStates,
    InputTypes,
    InputValidation,
    KuiText,
    TranslocoPipe,
  ],
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class Input {}
