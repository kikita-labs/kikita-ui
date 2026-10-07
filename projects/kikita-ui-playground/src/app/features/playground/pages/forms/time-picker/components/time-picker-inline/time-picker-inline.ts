import { Component, signal } from '@angular/core';

import { KuiTimePickerPanel } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { createPickerTime } from '../../helpers';

/** Shows the Time Picker panel used on its own without a trigger input. */
@Component({
  selector: 'app-time-picker-inline',
  imports: [KuiTimePickerPanel, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './time-picker-inline.html',
  styleUrl: '../time-picker-grid.scss',
})
export class TimePickerInline {
  protected readonly inlineTime = signal<Date | null>(createPickerTime(14, 30, 45));
}
