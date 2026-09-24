import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  DatePickerCompact,
  DatePickerDefault,
  DatePickerFieldStates,
  DatePickerForm,
  DatePickerManualBinding,
  DatePickerSelected,
} from './components';

/** Shows the Date Picker's documented input and calendar compositions. */
@Component({
  selector: 'app-date-picker',
  imports: [
    DatePickerCompact,
    DatePickerDefault,
    DatePickerFieldStates,
    DatePickerForm,
    DatePickerManualBinding,
    DatePickerSelected,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
})
export class DatePicker {}
