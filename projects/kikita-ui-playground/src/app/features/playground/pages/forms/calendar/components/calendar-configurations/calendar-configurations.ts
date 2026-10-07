import { Component, signal } from '@angular/core';

import { KuiCalendar, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Groups Calendar's optional footer, date constraints, and locale inputs. */
@Component({
  selector: 'app-calendar-configurations',
  imports: [KuiCalendar, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './calendar-configurations.html',
  styleUrl: './calendar-configurations.scss',
})
export class CalendarConfigurations {
  protected readonly minSelectableDate = new Date(2026, 4, 8);
  protected readonly maxSelectableDate = new Date(2026, 4, 24);
  protected readonly disabledDates = [new Date(2026, 4, 18)];

  protected readonly footerValue = signal<Date | null>(new Date(2026, 4, 25));
  protected readonly footerViewDate = signal(new Date(2026, 4, 1));
  protected readonly constrainedValue = signal<Date | null>(new Date(2026, 4, 14));
  protected readonly constrainedViewDate = signal(new Date(2026, 4, 1));
  protected readonly englishValue = signal<Date | null>(new Date(2026, 4, 12));
  protected readonly englishViewDate = signal(new Date(2026, 4, 1));
  protected readonly russianValue = signal<Date | null>(new Date(2026, 4, 12));
  protected readonly russianViewDate = signal(new Date(2026, 4, 1));
}
