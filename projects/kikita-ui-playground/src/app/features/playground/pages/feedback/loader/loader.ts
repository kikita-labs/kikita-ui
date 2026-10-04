import { Component } from '@angular/core';

import { KuiLoader, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { LoaderCompositions, LoaderConsumerStatus, LoaderSizes } from './components';

/** Shows Loader defaults, supported sizes, and documented consumer compositions. */
@Component({
  selector: 'app-loader',
  imports: [
    KuiLoader,
    KuiText,
    LoaderCompositions,
    LoaderConsumerStatus,
    LoaderSizes,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {}
