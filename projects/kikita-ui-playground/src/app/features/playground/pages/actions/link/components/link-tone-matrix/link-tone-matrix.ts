import { Component } from '@angular/core';

import { KuiLink, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows every Link tone at every underline mode. */
@Component({
  selector: 'app-link-tone-matrix',
  imports: [KuiLink, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './link-tone-matrix.html',
  styleUrl: './link-tone-matrix.scss',
})
export class LinkToneMatrix {
  protected readonly tones = [
    'default',
    'muted',
    'primary',
    'success',
    'warning',
    'danger',
  ] as const;

  protected readonly underlines = ['always', 'hover', 'none'] as const;
}
