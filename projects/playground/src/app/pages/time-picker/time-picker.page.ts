import { Component, signal, ViewEncapsulation } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import {
  KuiCellDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
  KuiTimePickerDirective,
  KuiTimePickerPanelComponent,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-time-picker-page',
  templateUrl: './time-picker.page.html',
  styleUrl: './time-picker.page.scss',
  imports: [
    PlaygroundPanelComponent,
    FormField,
    KuiCellDirective,
    KuiFieldComponent,
    KuiDropdownComponent,
    KuiTableDirective,
    KuiThDirective,
    KuiThGroupDirective,
    KuiTimePickerDirective,
    KuiTimePickerPanelComponent,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class TimePickerPage {
  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];

  protected readonly stateCols: {
    value: 'default' | 'invalid' | 'disabled' | 'readonly';
    label: string;
  }[] = [
    { value: 'default', label: 'Default' },
    { value: 'invalid', label: 'Invalid' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'readonly', label: 'Readonly' },
  ];

  /**
   * One shared time signal per size/state matrix cell -- `input[kuiTimePicker]` has no `size`
   * input of its own (same as `kuiDatePicker`); sizing flows purely from the ambient
   * `kui-field[size]` cascade, so the matrix varies `kui-field`'s `size`, not a per-control prop.
   */
  protected readonly matrixTime = signal<Date | null>(new Date(2026, 0, 1, 14, 30));

  protected readonly signalFormsModel = signal({ deliveryTime: null as Date | null });
  protected readonly signalFormsForm = form(this.signalFormsModel, (path) => {
    required(path.deliveryTime, { message: 'Delivery time is required' });
  });
  protected readonly basicTime = signal<Date | null>(new Date(2026, 0, 1, 14, 30));
  protected readonly extendedTime = signal<Date | null>(new Date(2026, 0, 1, 14, 30, 0));
  protected readonly hintTime = signal<Date | null>(null);
  protected readonly clearableTime = signal<Date | null>(new Date(2026, 0, 1, 9, 0));
  protected readonly notClearableTime = signal<Date | null>(new Date(2026, 0, 1, 9, 0));
  protected readonly disabledTime = signal<Date | null>(new Date(2026, 0, 1, 9, 0));
  protected readonly readonlyTime = signal<Date | null>(new Date(2026, 0, 1, 9, 0));
  protected readonly invalidExampleTime = signal<Date | null>(new Date(2026, 0, 1, 14, 30));
  protected readonly wideTime = signal<Date | null>(new Date(2026, 0, 1, 14, 30));
  protected readonly boundedTime = signal<Date | null>(new Date(2026, 0, 1, 11, 0));
  protected readonly minTime = new Date(2026, 0, 1, 9, 0);
  protected readonly maxTime = new Date(2026, 0, 1, 18, 0);
  protected readonly disabledMinutes = (): readonly number[] =>
    Array.from({ length: 15 }, (_, i) => i);
  protected readonly inlineTime = signal<Date | null>(new Date(2026, 0, 1, 14, 30, 0));

  protected readonly basicSnippet = `<kui-field label="Meeting time">
  <input kuiTimePicker [(value)]="time" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="280px">
    <kui-time-picker-panel />
  </kui-dropdown>
</kui-field>`;

  protected readonly extendedSnippet = `<kui-field label="Slot" hint="15-minute/second slots">
  <input
    kuiTimePicker
    [(value)]="time"
    format="12h"
    [showSeconds]="true"
    [minuteStep]="15"
    [secondStep]="15"
  />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="300px">
    <kui-time-picker-panel />
  </kui-dropdown>
</kui-field>`;

  protected readonly hintSnippet = `<kui-field label="Delivery time" hint="Business hours 09:00-18:00" [required]="true">
  <input kuiTimePicker [(value)]="time" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="280px">
    <kui-time-picker-panel />
  </kui-dropdown>
</kui-field>`;

  protected readonly clearableSnippet = `<input kuiTimePicker [(value)]="time" />
<input kuiTimePicker [(value)]="time" [clearable]="false" />`;

  protected readonly disabledReadonlySnippet = `<input kuiTimePicker [(value)]="time" [disabled]="true" />
<input kuiTimePicker [(value)]="time" [readonly]="true" />`;

  protected readonly invalidSnippet = `<!-- Type 12:3 and stop -- an incomplete minute group stays invalid -->
<input kuiTimePicker [(value)]="time" />`;

  protected readonly wideSnippet = `<kui-field label="Meeting time" class="wide-field">
  <input kuiTimePicker [(value)]="time" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="280px">
    <kui-time-picker-panel />
  </kui-dropdown>
</kui-field>`;

  protected readonly boundedSnippet = `const minTime = new Date(2026, 0, 1, 9, 0);
const maxTime = new Date(2026, 0, 1, 18, 0);
const disabledMinutes = (hour: number) => Array.from({ length: 15 }, (_, i) => i); // 00-14

<kui-field label="Appointment" hint="Business hours 09:00-18:00, first 15 min of every hour blocked">
  <input
    kuiTimePicker
    [(value)]="time"
    [minTime]="minTime"
    [maxTime]="maxTime"
    [hourStep]="3"
    [disabledMinutes]="disabledMinutes"
  />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="280px">
    <kui-time-picker-panel />
  </kui-dropdown>
</kui-field>`;

  protected readonly signalFormsSnippet = `const model = signal({ deliveryTime: null as Date | null });
const deliveryForm = form(model, (path) => {
  required(path.deliveryTime, { message: 'Delivery time is required' });
});`;

  protected readonly signalFormsTemplateSnippet = `<kui-field label="Delivery time">
  <input kuiTimePicker [formField]="deliveryForm.deliveryTime" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="280px">
    <kui-time-picker-panel />
  </kui-dropdown>
</kui-field>`;

  protected readonly inlineSnippet = `<kui-time-picker-panel [(value)]="time" [showSeconds]="true" />`;
}
