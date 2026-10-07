import { Component, signal } from '@angular/core';

import { KuiCalendar } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the default single-date Calendar with only a fixed month for stable examples. */
@Component({
  selector: 'app-calendar-default',
  imports: [KuiCalendar, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './calendar-default.html',
  styleUrl: './calendar-default.scss',
})
export class CalendarDefault {
  protected readonly viewDate = signal(new Date(2026, 4, 1));
}
