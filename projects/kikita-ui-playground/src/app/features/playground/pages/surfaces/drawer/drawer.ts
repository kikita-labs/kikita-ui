import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  DrawerContentExamples,
  DrawerDismissalExamples,
  DrawerSideExamples,
  DrawerSizeExamples,
} from './components';

/** Shows the supported Drawer placement, sizing, content, and dismissal behaviors. */
@Component({
  selector: 'app-drawer',
  imports: [
    DrawerContentExamples,
    DrawerDismissalExamples,
    DrawerSideExamples,
    DrawerSizeExamples,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './drawer.html',
  styleUrl: './drawer.scss',
})
export class Drawer {}
