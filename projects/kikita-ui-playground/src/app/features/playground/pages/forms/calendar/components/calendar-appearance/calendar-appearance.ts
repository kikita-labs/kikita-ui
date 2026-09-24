import { Component, signal } from '@angular/core';

import { KuiCalendarComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Groups the supported compact size and flat composition examples. */
@Component({
  selector: 'app-calendar-appearance',
  imports: [KuiCalendarComponent, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './calendar-appearance.html',
})
export class CalendarAppearance {
  protected readonly compactValue = signal<Date | null>(new Date(2026, 4, 20));
  protected readonly compactViewDate = signal(new Date(2026, 4, 1));
  protected readonly flatValue = signal<Date | null>(new Date(2026, 4, 8));
  protected readonly flatViewDate = signal(new Date(2026, 4, 1));
}
