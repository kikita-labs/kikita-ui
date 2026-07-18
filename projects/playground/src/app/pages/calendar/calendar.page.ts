import { DatePipe } from '@angular/common';
import { Component, computed, signal, ViewEncapsulation } from '@angular/core';

import { KuiButtonDirective, KuiCalendarComponent } from '@kikita-labs/ui';

import type { KuiCalendarMode, KuiCalendarValue, KuiDateRange } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-calendar-page',
  imports: [KuiCalendarComponent, KuiButtonDirective, PlaygroundPanelComponent, DatePipe],
  templateUrl: './calendar.page.html',
  styleUrl: './calendar.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CalendarPage {
  protected readonly singleValue = signal<KuiCalendarValue>(new Date());
  protected readonly rangeValue = signal<KuiCalendarValue>(null);
  protected readonly restrictedValue = signal<KuiCalendarValue>(null);
  protected readonly sidebarValue = signal<KuiCalendarValue>(new Date());
  protected readonly ruValue = signal<KuiCalendarValue>(null);
  protected readonly footerValue = signal<KuiCalendarValue>(null);

  protected readonly mode = signal<KuiCalendarMode>('single');
  protected readonly restrictPast = signal(true);
  protected readonly today = new Date();

  protected readonly minDate = signal<Date | undefined>(this.today);

  /** `singleValue` only ever holds a `Date` while `kui-calendar` is in single mode. */
  protected readonly singleDate = computed(() => this.singleValue() as Date | null);
  /** `rangeValue` only ever holds a {@link KuiDateRange} while `kui-calendar` is in range mode. */
  protected readonly range = computed(() => this.rangeValue() as KuiDateRange | null);

  protected toggleRestrict(): void {
    this.restrictPast.update((v) => !v);
    this.minDate.set(this.restrictPast() ? this.today : undefined);
  }
}
