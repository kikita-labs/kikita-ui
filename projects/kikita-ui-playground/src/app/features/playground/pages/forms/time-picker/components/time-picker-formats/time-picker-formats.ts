import { Component, signal } from '@angular/core';

import {
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiTimePickerDirective,
  KuiTimePickerPanelComponent,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { createPickerTime } from '../../helpers';

/** Shows the 24-hour and 12-hour formats with and without a seconds column. */
@Component({
  selector: 'app-time-picker-formats',
  imports: [
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiTimePickerDirective,
    KuiTimePickerPanelComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './time-picker-formats.html',
  styleUrl: '../time-picker-grid.scss',
})
export class TimePickerFormats {
  protected readonly time24 = signal<Date | null>(createPickerTime(14, 30));
  protected readonly time24Seconds = signal<Date | null>(createPickerTime(14, 30, 45));
  protected readonly time12 = signal<Date | null>(createPickerTime(14, 30));
  protected readonly time12Seconds = signal<Date | null>(createPickerTime(9, 5, 30));
}
