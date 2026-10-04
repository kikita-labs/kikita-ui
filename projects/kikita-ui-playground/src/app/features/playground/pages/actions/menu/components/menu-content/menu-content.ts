import { Component } from '@angular/core';

import {
  KuiButton,
  KuiMenu,
  KuiMenuFor,
  KuiMenuHeader,
  KuiMenuItem,
  KuiSeparator,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-menu-content',
  imports: [
    KuiButton,
    KuiMenu,
    KuiMenuFor,
    KuiMenuHeader,
    KuiMenuItem,
    KuiSeparator,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './menu-content.html',
  styleUrl: './menu-content.scss',
})
export class MenuContent {}
