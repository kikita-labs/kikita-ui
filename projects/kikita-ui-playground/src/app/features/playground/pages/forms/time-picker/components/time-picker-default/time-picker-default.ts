import { Component } from '@angular/core';

import {
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiTimePickerDirective,
  KuiTimePickerPanelComponent,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the minimally configured Time Picker with an empty value. */
@Component({
  selector: 'app-time-picker-default',
  imports: [
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiTimePickerDirective,
    KuiTimePickerPanelComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './time-picker-default.html',
  styleUrl: '../time-picker-grid.scss',
})
export class TimePickerDefault {}
