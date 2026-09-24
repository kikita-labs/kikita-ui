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

/** Shows the Date Picker with the supported compact field and calendar sizes. */
@Component({
  selector: 'app-date-picker-compact',
  imports: [
    KuiCalendarComponent,
    KuiDatePickerDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './date-picker-compact.html',
})
export class DatePickerCompact {
  protected readonly calendarLocale = createDatePickerCalendarLocale();
  protected readonly selectedDate = signal<Date | null>(new Date(2026, 4, 20));
  protected readonly viewDate = signal(new Date(2026, 4, 1));
}
