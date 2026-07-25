import { DatePipe } from '@angular/common';
import { Component, signal, ViewEncapsulation } from '@angular/core';

import { KuiButtonDirective, KuiCalendarComponent } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-calendar-page',
  imports: [KuiCalendarComponent, KuiButtonDirective, PlaygroundPanelComponent, DatePipe],
  templateUrl: './calendar.page.html',
  styleUrl: './calendar.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CalendarPage {
  protected readonly singleValue = signal<Date | null>(new Date());
  protected readonly restrictedValue = signal<Date | null>(null);
  protected readonly sidebarValue = signal<Date | null>(new Date());
  protected readonly ruValue = signal<Date | null>(null);
  protected readonly footerValue = signal<Date | null>(null);

  protected readonly restrictPast = signal(true);
  protected readonly today = new Date();

  protected readonly minDate = signal<Date | undefined>(this.today);

  protected toggleRestrict(): void {
    this.restrictPast.update((v) => !v);
    this.minDate.set(this.restrictPast() ? this.today : undefined);
  }

  protected readonly basicSnippet = `<kui-calendar [(value)]="selectedDate" />`;

  protected readonly disabledSnippet = `<kui-calendar [(value)]="selectedDate" [minDate]="today" />`;

  protected readonly sizesSnippet = `<kui-calendar [(value)]="selectedDate" />
<kui-calendar size="sm" [(value)]="selectedDate" />`;

  protected readonly localeSnippet = `<kui-calendar locale="en-US" [(value)]="selectedDate" />
<kui-calendar locale="ru-RU" [(value)]="selectedDate" />`;

  protected readonly footerSnippet = `<kui-calendar showFooter [(value)]="selectedDate" />`;

  protected readonly customFooterSnippet = `<kui-calendar [(value)]="selectedDate">
  <div kuiCalendarFooter class="custom-footer">
    <button type="button" kuiButton shape="ghost" size="xs" (click)="selectedDate.set(null)">
      Clear
    </button>
  </div>
</kui-calendar>`;
}
