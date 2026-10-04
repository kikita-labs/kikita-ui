import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  ProgressCompositions,
  ProgressDefault,
  ProgressLiveDemo,
  ProgressStates,
  ProgressVariantMatrix,
} from './components';

/** Shows the public Progress shapes, values, sizes, colors, and consumer compositions. */
@Component({
  selector: 'app-progress',
  imports: [
    KuiText,
    ProgressCompositions,
    ProgressDefault,
    ProgressLiveDemo,
    ProgressStates,
    ProgressVariantMatrix,
    TranslocoPipe,
  ],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress {}
