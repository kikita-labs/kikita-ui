import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  ComboboxAffordances,
  ComboboxDefault,
  ComboboxFieldStates,
  ComboboxFiltering,
  ComboboxModes,
  ComboboxSignalForms,
} from './components';

@Component({
  selector: 'app-combobox',
  imports: [
    ComboboxAffordances,
    ComboboxDefault,
    ComboboxFieldStates,
    ComboboxFiltering,
    ComboboxModes,
    ComboboxSignalForms,
    KuiText,
    TranslocoPipe,
  ],
  templateUrl: './combobox.html',
  styleUrl: './combobox.scss',
})
export class Combobox {}
