import { Component, signal } from '@angular/core';

import { KuiDropdown, KuiField, KuiTimePicker, KuiTimePickerPanel } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { createPickerTime } from '../../helpers';
import { TIME_PICKER_FIRST_QUARTER } from './constants';

/** Shows minimum and maximum time bounds and disabled hour, minute, and second slots. */
@Component({
  selector: 'app-time-picker-bounds',
  imports: [
    KuiDropdown,
    KuiField,
    KuiTimePicker,
    KuiTimePickerPanel,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './time-picker-bounds.html',
  styleUrl: '../time-picker-grid.scss',
})
export class TimePickerBounds {
  protected readonly minimumTime = createPickerTime(9, 0);
  protected readonly maximumTime = createPickerTime(18, 0);

  protected readonly businessTime = signal<Date | null>(createPickerTime(10, 30));
  protected readonly lunchTime = signal<Date | null>(createPickerTime(11, 0));
  protected readonly quarterTime = signal<Date | null>(createPickerTime(10, 30));
  protected readonly secondsTime = signal<Date | null>(createPickerTime(10, 30, 30));

  protected readonly blockedHours = (): readonly number[] => [12];
  protected readonly blockedMinutes = (): readonly number[] => TIME_PICKER_FIRST_QUARTER;
  protected readonly blockedSeconds = (): readonly number[] => TIME_PICKER_FIRST_QUARTER;
}
