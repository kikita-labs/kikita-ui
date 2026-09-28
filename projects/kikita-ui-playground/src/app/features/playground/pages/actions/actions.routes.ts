import type { Routes } from '@angular/router';

import { provideKuiIcons } from '@kikita-labs/ui';

import { PlaygroundRoute } from '@app/enums';
import { provideTranslocoScope } from '@jsverse/transloco';

import { BUTTON_ICON_REGISTRY } from './button/constants';

export const PLAYGROUND_ACTIONS_ROUTES: Routes = [
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Button].join('/'),
    data: { componentId: PlaygroundRoute.Button },
    providers: [provideTranslocoScope('button'), provideKuiIcons(BUTTON_ICON_REGISTRY)],
    loadComponent: () => import('./button').then((page) => page.Button),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.IconButton].join('/'),
    data: { componentId: PlaygroundRoute.IconButton },
    providers: [provideTranslocoScope('icon-button')],
    loadComponent: () => import('./icon-button').then((page) => page.IconButton),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Menu].join('/'),
    data: { componentId: PlaygroundRoute.Menu },
    providers: [provideTranslocoScope('menu')],
    loadComponent: () => import('./menu').then((page) => page.Menu),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.CommandPalette].join('/'),
    data: { componentId: PlaygroundRoute.CommandPalette },
    providers: [provideTranslocoScope('command-palette')],
    loadComponent: () => import('./command-palette').then((page) => page.CommandPalette),
  },
];
