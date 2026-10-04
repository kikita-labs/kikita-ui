import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { ComboboxAsyncMode, ComboboxFreeMode } from './components';

@Component({
  selector: 'app-combobox-modes',
  imports: [ComboboxAsyncMode, ComboboxFreeMode, KuiText, TranslocoPipe, PlaygroundExampleCard],
  templateUrl: './combobox-modes.html',
  styleUrl: './combobox-modes.scss',
})
export class ComboboxModes {}
