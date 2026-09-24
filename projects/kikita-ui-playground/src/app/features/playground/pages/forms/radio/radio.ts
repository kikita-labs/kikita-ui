import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { RadioDefault, RadioSizes, RadioStates } from './components';

/** Shows the Radio primitive's supported sizes and native interaction states. */
@Component({
  selector: 'app-radio',
  imports: [RadioDefault, RadioSizes, RadioStates, KuiTextDirective, TranslocoPipe],
  templateUrl: './radio.html',
  styleUrl: './radio.scss',
})
export class Radio {}
