import { DatePipe } from '@angular/common';
import { Component, computed, signal, ViewEncapsulation } from '@angular/core';

import { KuiButtonDirective, KuiCalendarRangeComponent } from '@kikita-labs/ui';

import type { KuiDateRange } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-calendar-range-page',
  imports: [KuiCalendarRangeComponent, KuiButtonDirective, PlaygroundPanelComponent, DatePipe],
  templateUrl: './calendar-range.page.html',
  styleUrl: './calendar-range.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CalendarRangePage {
  protected readonly rangeValue = signal<KuiDateRange | null>(null);
  protected readonly restrictedValue = signal<KuiDateRange | null>(null);
  protected readonly sidebarValue = signal<KuiDateRange | null>(null);
  protected readonly footerValue = signal<KuiDateRange | null>(null);

  protected readonly restrictPast = signal(true);
  protected readonly today = new Date();

  protected readonly minDate = signal<Date | undefined>(this.today);

  protected readonly rangeLabel = computed(() => {
    const range = this.rangeValue();
    if (!range?.start) return null;
    return range;
  });

  protected toggleRestrict(): void {
    this.restrictPast.update((v) => !v);
    this.minDate.set(this.restrictPast() ? this.today : undefined);
  }

  protected readonly basicSnippet = `<kui-calendar-range [(value)]="selectedRange" />`;

  protected readonly disabledSnippet = `<kui-calendar-range [(value)]="selectedRange" [minDate]="today" />`;

  protected readonly sizesSnippet = `<kui-calendar-range [(value)]="selectedRange" />
<kui-calendar-range size="sm" [(value)]="selectedRange" />`;

  protected readonly footerSnippet = `<kui-calendar-range showFooter [(value)]="selectedRange" />`;
}
