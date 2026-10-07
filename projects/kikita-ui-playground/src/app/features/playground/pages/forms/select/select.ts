import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  SelectDefault,
  SelectExplicitId,
  SelectFieldDefaults,
  SelectKeyboard,
  SelectModes,
  SelectProviderDefaults,
  SelectSizes,
  SelectStates,
  SelectValidation,
} from './components';

/** Shows the supported Select values, modes, field compositions, and interactions. */
@Component({
  selector: 'app-select',
  imports: [
    KuiText,
    SelectDefault,
    SelectExplicitId,
    SelectFieldDefaults,
    SelectKeyboard,
    SelectModes,
    SelectProviderDefaults,
    SelectSizes,
    SelectStates,
    SelectValidation,
    TranslocoPipe,
  ],
  templateUrl: './select.html',
  styleUrl: './select.scss',
})
export class Select {}
