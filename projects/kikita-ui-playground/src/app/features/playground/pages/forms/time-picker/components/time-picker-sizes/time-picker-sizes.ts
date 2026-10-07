import { Component, signal } from '@angular/core';

import { KuiDropdown, KuiField, KuiTimePicker, KuiTimePickerPanel } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { createPickerTime } from '../../helpers';

/** Shows the Time Picker at each Field size. */
@Component({
  selector: 'app-time-picker-sizes',
  imports: [
    KuiDropdown,
    KuiField,
    KuiTimePicker,
    KuiTimePickerPanel,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './time-picker-sizes.html',
  styleUrl: '../time-picker-grid.scss',
})
export class TimePickerSizes {
  protected readonly sizeTime = signal<Date | null>(createPickerTime(9, 5));
}
