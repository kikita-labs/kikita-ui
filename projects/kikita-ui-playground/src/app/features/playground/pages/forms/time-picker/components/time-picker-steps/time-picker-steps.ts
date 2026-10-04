import { Component, signal } from '@angular/core';

import { KuiDropdown, KuiField, KuiTimePicker, KuiTimePickerPanel } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { createPickerTime } from '../../helpers';

/** Shows hour, minute, and second steps thinning the picker columns. */
@Component({
  selector: 'app-time-picker-steps',
  imports: [
    KuiDropdown,
    KuiField,
    KuiTimePicker,
    KuiTimePickerPanel,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './time-picker-steps.html',
  styleUrl: '../time-picker-grid.scss',
})
export class TimePickerSteps {
  protected readonly slotTime = signal<Date | null>(createPickerTime(14, 30, 45));
  protected readonly hourSlotTime = signal<Date | null>(createPickerTime(9, 15));
}
