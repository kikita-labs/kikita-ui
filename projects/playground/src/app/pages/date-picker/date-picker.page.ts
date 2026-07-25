import { Component, signal, ViewEncapsulation } from '@angular/core';

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
  protected readonly legacyDate = signal<Date | null>(new Date());
  protected readonly legacyViewDate = signal<Date>(new Date());
  protected readonly hintDate = signal<Date | null>(new Date());
  protected readonly restrictedDate = signal<Date | null>(null);
  protected readonly clearableDate = signal<Date | null>(new Date());
  protected readonly notClearableDate = signal<Date | null>(new Date());
  protected readonly disabledDate = signal<Date | null>(new Date());
  protected readonly readonlyDate = signal<Date | null>(new Date());
  protected readonly wideDate = signal<Date | null>(new Date());

  protected readonly basicSnippet = `<kui-field label="Meeting date">
  <input kuiDatePicker [(value)]="date" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="420px">
    <kui-calendar flat showFooter />
  </kui-dropdown>
</kui-field>`;

  protected readonly legacySnippet = `<!-- Still supported: manual binding, same as before this feature shipped. -->
<kui-field label="Meeting date">
  <input kuiDatePicker [(value)]="date" [(viewDate)]="viewDate" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="420px">
    <kui-calendar flat [(value)]="date" [(viewDate)]="viewDate" showFooter />
  </kui-dropdown>
</kui-field>`;

  protected readonly hintSnippet = `<kui-field label="Meeting date" hint="Business days only" [required]="true">
  <input kuiDatePicker [(value)]="date" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="420px">
    <kui-calendar flat showFooter />
  </kui-dropdown>
</kui-field>`;

  protected readonly disabledDatesSnippet = `<kui-field label="Departure" hint="Today or later">
  <input kuiDatePicker [(value)]="date" [minDate]="today" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="420px">
    <kui-calendar flat showFooter />
  </kui-dropdown>
</kui-field>`;

  protected readonly clearableSnippet = `<input kuiDatePicker [(value)]="date" />
<input kuiDatePicker [(value)]="date" [clearable]="false" />`;

  protected readonly disabledReadonlySnippet = `<input kuiDatePicker [(value)]="date" [disabled]="true" />
<input kuiDatePicker [(value)]="date" [readonly]="true" />`;

  protected readonly invalidSnippet = `<!-- Try typing 32.13.2026 -->
<input kuiDatePicker [(value)]="date" />`;

  protected readonly wideSnippet = `<kui-field label="Meeting date" class="wide-field">
  <input kuiDatePicker [(value)]="date" />
  <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="420px">
    <kui-calendar flat showFooter />
  </kui-dropdown>
</kui-field>`;
}
