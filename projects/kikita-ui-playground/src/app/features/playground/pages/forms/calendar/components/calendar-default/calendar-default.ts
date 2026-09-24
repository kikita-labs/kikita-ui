import { Component, signal } from '@angular/core';

import { KuiCalendarComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the default single-date Calendar with only a fixed month for stable examples. */
@Component({
  selector: 'app-calendar-default',
  imports: [KuiCalendarComponent, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './calendar-default.html',
})
export class CalendarDefault {
  protected readonly viewDate = signal(new Date(2026, 4, 1));
}
