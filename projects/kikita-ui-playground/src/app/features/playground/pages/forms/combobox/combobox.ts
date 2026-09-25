import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  ComboboxAffordances,
  ComboboxDefault,
  ComboboxFieldStates,
  ComboboxFiltering,
  ComboboxModes,
} from './components';

@Component({
  selector: 'app-combobox',
  imports: [
    ComboboxAffordances,
    ComboboxDefault,
    ComboboxFieldStates,
    ComboboxFiltering,
    ComboboxModes,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './combobox.html',
  styleUrl: './combobox.scss',
})
export class Combobox {}
