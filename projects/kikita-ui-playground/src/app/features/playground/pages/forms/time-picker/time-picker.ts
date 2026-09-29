import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  TimePickerBounds,
  TimePickerDefault,
  TimePickerFieldStates,
  TimePickerFieldWiring,
  TimePickerForm,
  TimePickerFormats,
  TimePickerInline,
  TimePickerSizes,
  TimePickerSteps,
} from './components';

/** Shows the Time Picker's documented input and panel compositions. */
@Component({
  selector: 'app-time-picker',
  imports: [
    KuiTextDirective,
    TimePickerBounds,
    TimePickerDefault,
    TimePickerFieldStates,
    TimePickerFieldWiring,
    TimePickerForm,
    TimePickerFormats,
    TimePickerInline,
    TimePickerSizes,
    TimePickerSteps,
    TranslocoPipe,
  ],
  templateUrl: './time-picker.html',
  styleUrl: './time-picker.scss',
})
export class TimePicker {}
