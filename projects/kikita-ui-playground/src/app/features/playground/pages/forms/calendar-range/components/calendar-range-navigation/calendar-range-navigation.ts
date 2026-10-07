import { Component, signal } from '@angular/core';

import { KuiCalendarRange } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiDateRange } from '@kikita-labs/ui';

/** Shows a consumer-composed linked pair that hides one navigation button on each calendar. */
@Component({
  selector: 'app-calendar-range-navigation',
  imports: [KuiCalendarRange, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './calendar-range-navigation.html',
  styleUrl: './calendar-range-navigation.scss',
})
export class CalendarRangeNavigation {
  protected readonly pairValue = signal<KuiDateRange | null>(null);
  protected readonly leadingViewDate = signal(new Date(2026, 4, 1));
  protected readonly trailingViewDate = signal(new Date(2026, 5, 1));

  /** Moves the leading calendar and keeps the trailing one exactly one month ahead. */
  protected setLeading(viewDate: Date): void {
    this.leadingViewDate.set(viewDate);
    this.trailingViewDate.set(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  }

  /** Moves the trailing calendar and keeps the leading one exactly one month behind. */
  protected setTrailing(viewDate: Date): void {
    this.trailingViewDate.set(viewDate);
    this.leadingViewDate.set(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  }
}
