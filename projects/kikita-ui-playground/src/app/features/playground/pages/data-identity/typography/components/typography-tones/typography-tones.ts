import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { TYPOGRAPHY_TONES } from '../../constants';

/** Shows every supported tone on the default body role. */
@Component({
  selector: 'app-typography-tones',
  imports: [KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './typography-tones.html',
  styleUrl: './typography-tones.scss',
})
export class TypographyTones {
  protected readonly tones = TYPOGRAPHY_TONES;
}
