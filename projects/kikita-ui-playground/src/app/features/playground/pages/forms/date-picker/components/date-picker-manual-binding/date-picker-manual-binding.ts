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

/** Shows the documented manual value and month bindings on the paired calendar. */
@Component({
  selector: 'app-date-picker-manual-binding',
  imports: [
    KuiCalendarComponent,
    KuiDatePickerDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './date-picker-manual-binding.html',
})
export class DatePickerManualBinding {
  protected readonly calendarLocale = createDatePickerCalendarLocale();
  protected readonly selectedDate = signal<Date | null>(new Date(2026, 4, 22));
  protected readonly viewDate = signal(new Date(2026, 4, 1));
}
