import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { MenuContent, MenuDefault, MenuPlacement, MenuSpacing } from './components';

@Component({
  selector: 'app-menu',
  imports: [KuiText, MenuContent, MenuDefault, MenuPlacement, MenuSpacing, TranslocoPipe],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {}
