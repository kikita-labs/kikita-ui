import { Component } from '@angular/core';

import { KuiAlertComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  AlertActionScenario,
  AlertAppearanceMatrix,
  AlertCustomContent,
  AlertLiveRegions,
  AlertSizeContent,
} from './components';

/** Shows the documented Alert appearances, shapes, sizes, slots, and controlled behavior. */
@Component({
  selector: 'app-alert',
  imports: [
    KuiAlertComponent,
    KuiTextDirective,
    AlertActionScenario,
    AlertAppearanceMatrix,
    AlertCustomContent,
    AlertLiveRegions,
    AlertSizeContent,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
})
export class Alert {}
