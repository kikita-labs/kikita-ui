import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiMenuComponent,
  KuiMenuForDirective,
  KuiMenuHeaderDirective,
  KuiMenuItemDirective,
  KuiSeparatorDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-menu-content',
  imports: [
    KuiButtonDirective,
    KuiMenuComponent,
    KuiMenuForDirective,
    KuiMenuHeaderDirective,
    KuiMenuItemDirective,
    KuiSeparatorDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './menu-content.html',
  styleUrl: './menu-content.scss',
})
export class MenuContent {}
