import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconStructuralOverride, IconStructuralSample } from './components';

/** Compares the built-in structural icons with a subtree that replaces them through `defaults.icons`. */
@Component({
  selector: 'app-icon-structural-examples',
  imports: [
    IconStructuralOverride,
    IconStructuralSample,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './icon-structural-examples.html',
  styleUrl: './icon-structural-examples.scss',
})
export class IconStructuralExamples {}
