import { Component } from '@angular/core';

import { KuiLoaderDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { LoaderCompositions, LoaderConsumerStatus, LoaderSizes } from './components';

/** Shows Loader defaults, supported sizes, and documented consumer compositions. */
@Component({
  selector: 'app-loader',
  imports: [
    KuiLoaderDirective,
    KuiTextDirective,
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
