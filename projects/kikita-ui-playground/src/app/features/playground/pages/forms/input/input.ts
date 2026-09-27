import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  InputDefault,
  InputExplicitId,
  InputSizes,
  InputStates,
  InputTypes,
  InputValidation,
} from './components';

/** Shows native input defaults, an explicit id, sizes, states, types, and Signal Forms integration. */
@Component({
  selector: 'app-input',
  imports: [
    InputDefault,
    InputExplicitId,
    InputSizes,
    InputStates,
    InputTypes,
    InputValidation,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class Input {}
