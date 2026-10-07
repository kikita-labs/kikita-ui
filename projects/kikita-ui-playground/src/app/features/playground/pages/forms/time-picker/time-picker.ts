import { Component } from '@angular/core';

import { KuiText, provideKuiDefaults } from '@kikita-labs/ui';

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
    KuiText,
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
  // Without a format the Time Picker follows the locale's hour cycle (12-hour in en-US). The page
  // pins 24 hours so its examples read the same in every language; the 12-hour examples set
  // `format="12h"`, and the locale-driven default is covered by the library unit specs.
  providers: [provideKuiDefaults({ timePicker: { format: '24h' } })],
  templateUrl: './time-picker.html',
  styleUrl: './time-picker.scss',
})
export class TimePicker {}
