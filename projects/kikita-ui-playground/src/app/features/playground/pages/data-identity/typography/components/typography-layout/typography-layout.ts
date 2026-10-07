import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { TYPOGRAPHY_STATUSES } from '../../constants';

/** Shows wrapping, container-owned truncation, and product compositions. */
@Component({
  selector: 'app-typography-layout',
  imports: [KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './typography-layout.html',
  styleUrl: './typography-layout.scss',
})
export class TypographyLayout {
  protected readonly statuses = TYPOGRAPHY_STATUSES;
}
