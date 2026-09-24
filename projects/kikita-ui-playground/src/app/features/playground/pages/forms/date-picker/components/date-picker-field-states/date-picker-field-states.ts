import { Component, signal } from '@angular/core';

import {
  KuiCalendarComponent,
  KuiDatePickerDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
  kuiProvideFieldOptions,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { createDatePickerCalendarLocale } from '../date-picker-calendar-locale';

/** Groups the Date Picker's supported bounds, disabled, readonly, and clearable states. */
@Component({
  selector: 'app-date-picker-field-states',
  imports: [
    KuiCalendarComponent,
    KuiDatePickerDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  providers: [kuiProvideFieldOptions({ clearable: true })],
  templateUrl: './date-picker-field-states.html',
  styleUrl: './date-picker-field-states.scss',
})
export class DatePickerFieldStates {
  protected readonly calendarLocale = createDatePickerCalendarLocale();
  protected readonly minimumDate = new Date(2026, 4, 8, 15, 30);
  protected readonly maximumDate = new Date(2026, 4, 24, 17, 45);

  protected readonly limitedValue = signal<Date | null>(new Date(2026, 4, 14));
  protected readonly limitedViewDate = signal(new Date(2026, 4, 1));
  protected readonly disabledValue = signal<Date | null>(new Date(2026, 4, 14));
  protected readonly disabledViewDate = signal(new Date(2026, 4, 1));
  protected readonly readonlyValue = signal<Date | null>(new Date(2026, 4, 20));
  protected readonly readonlyViewDate = signal(new Date(2026, 4, 1));
  protected readonly localClearFalseValue = signal<Date | null>(new Date(2026, 4, 20));
  protected readonly localClearFalseViewDate = signal(new Date(2026, 4, 1));
  protected readonly inheritedClearValue = signal<Date | null>(new Date(2026, 4, 20));
  protected readonly inheritedClearViewDate = signal(new Date(2026, 4, 1));
}
