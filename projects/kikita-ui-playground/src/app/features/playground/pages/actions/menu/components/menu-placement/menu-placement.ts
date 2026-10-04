import { Component } from '@angular/core';

import { KuiButton, KuiMenu, KuiMenuFor, KuiMenuItem } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-menu-placement',
  imports: [KuiButton, KuiMenu, KuiMenuFor, KuiMenuItem, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './menu-placement.html',
  styleUrl: './menu-placement.scss',
})
export class MenuPlacement {}
