import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiMenuComponent,
  KuiMenuForDirective,
  KuiMenuItemDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-menu-placement',
  imports: [
    KuiButtonDirective,
    KuiMenuComponent,
    KuiMenuForDirective,
    KuiMenuItemDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './menu-placement.html',
  styleUrl: './menu-placement.scss',
})
export class MenuPlacement {}
