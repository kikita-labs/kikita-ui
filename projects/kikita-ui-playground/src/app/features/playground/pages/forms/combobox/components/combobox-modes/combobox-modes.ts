import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { ComboboxAsyncMode, ComboboxFreeMode } from './components';

@Component({
  selector: 'app-combobox-modes',
  imports: [
    ComboboxAsyncMode,
    ComboboxFreeMode,
    KuiTextDirective,
    TranslocoPipe,
    PlaygroundExampleCard,
  ],
  templateUrl: './combobox-modes.html',
  styleUrl: './combobox-modes.scss',
})
export class ComboboxModes {}
