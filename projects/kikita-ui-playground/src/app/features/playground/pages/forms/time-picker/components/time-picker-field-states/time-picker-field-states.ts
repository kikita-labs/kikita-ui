import { Component, signal } from '@angular/core';

import {
  KuiDropdownComponent,
  KuiFieldComponent,
  kuiProvideFieldOptions,
  KuiTimePickerDirective,
  KuiTimePickerPanelComponent,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { createPickerTime } from '../../helpers';

/** Groups the Time Picker clearable, disabled, readonly, and placeholder states. */
@Component({
  selector: 'app-time-picker-field-states',
  imports: [
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiTimePickerDirective,
    KuiTimePickerPanelComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  providers: [kuiProvideFieldOptions({ clearable: false })],
  templateUrl: './time-picker-field-states.html',
  styleUrl: '../time-picker-grid.scss',
})
export class TimePickerFieldStates {
  protected readonly inheritedTime = signal<Date | null>(createPickerTime(9, 5));
  protected readonly localTime = signal<Date | null>(createPickerTime(9, 5));
  protected readonly disabledTime = signal<Date | null>(createPickerTime(9, 5));
  protected readonly readonlyTime = signal<Date | null>(createPickerTime(9, 5));
  protected readonly placeholderTime = signal<Date | null>(null);
}
