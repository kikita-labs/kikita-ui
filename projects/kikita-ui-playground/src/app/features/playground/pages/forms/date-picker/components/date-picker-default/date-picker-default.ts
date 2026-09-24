import { Component, signal } from '@angular/core';

import {
  KuiCalendarComponent,
  KuiDatePickerDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { createDatePickerCalendarLocale } from '../date-picker-calendar-locale';

/** Shows the minimally configured Date Picker composition with an empty value. */
@Component({
  selector: 'app-date-picker-default',
  imports: [
    KuiCalendarComponent,
    KuiDatePickerDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './date-picker-default.html',
})
export class DatePickerDefault {
  protected readonly calendarLocale = createDatePickerCalendarLocale();
  protected readonly viewDate = signal(new Date(2026, 5, 1));
}
