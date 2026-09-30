import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  CalendarRangeAppearance,
  CalendarRangeConfigurations,
  CalendarRangeDefault,
  CalendarRangeNavigation,
} from './components';

/** Shows Calendar Range's supported selection, appearance, and constraint states in example groups. */
@Component({
  selector: 'app-calendar-range',
  imports: [
    CalendarRangeAppearance,
    CalendarRangeConfigurations,
    CalendarRangeDefault,
    CalendarRangeNavigation,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './calendar-range.html',
  styleUrl: './calendar-range.scss',
})
export class CalendarRange {}
