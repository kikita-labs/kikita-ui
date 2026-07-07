import { Component, ViewEncapsulation, signal } from '@angular/core';

import {
  KuiCalendarComponent,
  KuiDatePickerDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-date-picker-page',
  templateUrl: './date-picker.page.html',
  styleUrl: './date-picker.page.scss',
  imports: [
    PlaygroundPanelComponent,
    KuiFieldComponent,
    KuiDropdownComponent,
    KuiDatePickerDirective,
    KuiCalendarComponent,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class DatePickerPage {
  protected readonly today = new Date();

  protected readonly basicDate = signal<Date | null>(new Date());
  protected readonly hintDate = signal<Date | null>(new Date());
  protected readonly restrictedDate = signal<Date | null>(null);
  protected readonly clearableDate = signal<Date | null>(new Date());
  protected readonly notClearableDate = signal<Date | null>(new Date());
  protected readonly disabledDate = signal<Date | null>(new Date());
  protected readonly readonlyDate = signal<Date | null>(new Date());
  protected readonly viewDate = signal<Date>(new Date());
}
