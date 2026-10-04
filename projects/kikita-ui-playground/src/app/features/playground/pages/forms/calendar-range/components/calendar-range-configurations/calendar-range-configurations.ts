import { Component, signal } from '@angular/core';

import { KuiCalendarRange, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiDateRange } from '@kikita-labs/ui';

/** Groups Calendar Range's footer, date constraint, and locale examples. */
@Component({
  selector: 'app-calendar-range-configurations',
  imports: [KuiCalendarRange, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './calendar-range-configurations.html',
  styleUrl: './calendar-range-configurations.scss',
})
export class CalendarRangeConfigurations {
  protected readonly minSelectableDate = new Date(2026, 4, 8);
  protected readonly maxSelectableDate = new Date(2026, 4, 24);
  protected readonly disabledDates = [new Date(2026, 4, 18)];
  protected readonly isWeekend = (date: Date): boolean =>
    date.getDay() === 0 || date.getDay() === 6;

  protected readonly footerEmptyValue = signal<KuiDateRange | null>(null);
  protected readonly footerEmptyViewDate = signal(new Date(2026, 4, 1));
  protected readonly footerOpenValue = signal<KuiDateRange | null>({
    start: new Date(2026, 4, 12),
    end: null,
  });
  protected readonly footerOpenViewDate = signal(new Date(2026, 4, 1));
  protected readonly footerCommittedValue = signal<KuiDateRange | null>({
    start: new Date(2026, 4, 12),
    end: new Date(2026, 4, 20),
  });
  protected readonly footerCommittedViewDate = signal(new Date(2026, 4, 1));
  protected readonly constrainedValue = signal<KuiDateRange | null>({
    start: new Date(2026, 4, 12),
    end: new Date(2026, 4, 20),
  });
  protected readonly constrainedViewDate = signal(new Date(2026, 4, 1));
  protected readonly predicateValue = signal<KuiDateRange | null>(null);
  protected readonly predicateViewDate = signal(new Date(2026, 4, 1));
  protected readonly englishValue = signal<KuiDateRange | null>({
    start: new Date(2026, 4, 12),
    end: new Date(2026, 4, 18),
  });
  protected readonly englishViewDate = signal(new Date(2026, 4, 1));
  protected readonly russianValue = signal<KuiDateRange | null>({
    start: new Date(2026, 4, 12),
    end: new Date(2026, 4, 18),
  });
  protected readonly russianViewDate = signal(new Date(2026, 4, 1));
}
