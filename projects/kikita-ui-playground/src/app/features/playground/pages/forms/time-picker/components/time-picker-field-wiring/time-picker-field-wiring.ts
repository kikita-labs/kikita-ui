import { Component, signal } from '@angular/core';

import {
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiTimePickerDirective,
  KuiTimePickerPanelComponent,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the Time Picker inside a Field with a hint, a required marker, and typed input. */
@Component({
  selector: 'app-time-picker-field-wiring',
  imports: [
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiTimePickerDirective,
    KuiTimePickerPanelComponent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './time-picker-field-wiring.html',
  styleUrl: '../time-picker-grid.scss',
})
export class TimePickerFieldWiring {
  protected readonly deliveryTime = signal<Date | null>(null);
  protected readonly typedTime = signal<Date | null>(null);
}
