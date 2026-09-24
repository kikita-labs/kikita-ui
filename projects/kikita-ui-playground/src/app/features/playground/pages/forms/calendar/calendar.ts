import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { CalendarAppearance, CalendarConfigurations, CalendarDefault } from './components';

/** Shows Calendar's supported selection and visual states in compact example groups. */
@Component({
  selector: 'app-calendar',
  imports: [
    CalendarAppearance,
    CalendarConfigurations,
    CalendarDefault,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {}
