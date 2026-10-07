import { Component, signal } from '@angular/core';

import { KuiCalendarRange } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiDateRange } from '@kikita-labs/ui';

/** Groups the supported compact size and flat composition examples with seeded ranges. */
@Component({
  selector: 'app-calendar-range-appearance',
  imports: [KuiCalendarRange, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './calendar-range-appearance.html',
  styleUrl: './calendar-range-appearance.scss',
})
export class CalendarRangeAppearance {
  protected readonly compactValue = signal<KuiDateRange | null>({
    start: new Date(2026, 4, 8),
    end: new Date(2026, 4, 14),
  });
  protected readonly compactViewDate = signal(new Date(2026, 4, 1));
  protected readonly flatValue = signal<KuiDateRange | null>({
    start: new Date(2026, 4, 27),
    end: new Date(2026, 5, 3),
  });
  protected readonly flatViewDate = signal(new Date(2026, 4, 1));
  protected readonly compactFlatValue = signal<KuiDateRange | null>({
    start: new Date(2026, 4, 14),
    end: new Date(2026, 4, 14),
  });
  protected readonly compactFlatViewDate = signal(new Date(2026, 4, 1));
}
