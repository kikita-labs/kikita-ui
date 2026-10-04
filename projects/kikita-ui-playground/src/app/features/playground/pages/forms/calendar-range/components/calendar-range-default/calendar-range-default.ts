import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';

import { KuiCalendarRange, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiDateRange } from '@kikita-labs/ui';

/** Shows the default empty Calendar Range and an interactive selection scenario with a readout. */
@Component({
  selector: 'app-calendar-range-default',
  imports: [DatePipe, KuiCalendarRange, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './calendar-range-default.html',
  styleUrl: './calendar-range-default.scss',
})
export class CalendarRangeDefault {
  protected readonly defaultViewDate = signal(new Date(2026, 4, 1));
  protected readonly selectionViewDate = signal(new Date(2026, 4, 1));

  protected readonly selectionValue = signal<KuiDateRange | null>(null);
}
