import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
  KuiDropdownComponent,
  KuiErrorDirective,
  KuiFieldComponent,
  KuiTimePickerDirective,
  KuiTimePickerPanelComponent,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { TIME_PICKER_FORM_DEFAULT_STATE } from './constants';
import { timePickerFormSchema } from './helpers';

/** Shows the Time Picker as an Angular Signal Forms native control. */
@Component({
  selector: 'app-time-picker-form',
  imports: [
    FormField,
    KuiDropdownComponent,
    KuiErrorDirective,
    KuiFieldComponent,
    KuiTimePickerDirective,
    KuiTimePickerPanelComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './time-picker-form.html',
})
export class TimePickerForm {
  protected readonly model = signal(TIME_PICKER_FORM_DEFAULT_STATE);

  protected readonly deliveryForm = form(this.model, timePickerFormSchema);
}
