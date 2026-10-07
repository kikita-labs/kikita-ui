import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  NumberInputDefault,
  NumberInputExplicitId,
  NumberInputSizes,
  NumberInputStates,
  NumberInputValidation,
  NumberInputVariants,
} from './components';

/** Shows the default Number Input, supported variants, sizes, states, and form integration. */
@Component({
  selector: 'app-number-input',
  imports: [
    KuiText,
    NumberInputDefault,
    NumberInputExplicitId,
    NumberInputSizes,
    NumberInputStates,
    NumberInputValidation,
    NumberInputVariants,
    TranslocoPipe,
  ],
  templateUrl: './number-input.html',
  styleUrl: './number-input.scss',
})
export class NumberInput {}
