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

/** Shows a Date Picker with a consumer-provided initial date. */
@Component({
  selector: 'app-date-picker-selected',
  imports: [
    KuiCalendarComponent,
    KuiDatePickerDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './date-picker-selected.html',
})
export class DatePickerSelected {
  protected readonly calendarLocale = createDatePickerCalendarLocale();
  protected readonly selectedDate = signal<Date | null>(new Date(2026, 4, 14));
  protected readonly viewDate = signal(new Date(2026, 4, 1));
}
