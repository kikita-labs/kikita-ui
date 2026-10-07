import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { KuiCalendar, KuiDatePicker, KuiDropdown, KuiError, KuiField } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { createDatePickerCalendarLocale } from '../date-picker-calendar-locale';
import { DATE_PICKER_FORM_DEFAULT_STATE } from './constants';
import { datePickerFormSchema } from './helpers';

/** Shows the Date Picker as an Angular Signal Forms native control. */
@Component({
  selector: 'app-date-picker-form',
  imports: [
    FormField,
    KuiCalendar,
    KuiDatePicker,
    KuiDropdown,
    KuiError,
    KuiField,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './date-picker-form.html',
  styleUrl: '../date-picker-calendar.scss',
})
export class DatePickerForm {
  protected readonly calendarLocale = createDatePickerCalendarLocale();
  protected readonly model = signal(DATE_PICKER_FORM_DEFAULT_STATE);
  protected readonly deliveryForm = form(this.model, datePickerFormSchema);
  protected readonly viewDate = signal(new Date(2026, 4, 1));
}
