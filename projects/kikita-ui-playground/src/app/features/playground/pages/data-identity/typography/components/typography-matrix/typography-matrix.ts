import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { TYPOGRAPHY_MATRIX_ROLES, TYPOGRAPHY_TONES } from '../../constants';

/** Shows every tone combined with representative roles. */
@Component({
  selector: 'app-typography-matrix',
  imports: [KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './typography-matrix.html',
  styleUrl: './typography-matrix.scss',
})
export class TypographyMatrix {
  protected readonly tones = TYPOGRAPHY_TONES;

  protected readonly roles = TYPOGRAPHY_MATRIX_ROLES;
}
