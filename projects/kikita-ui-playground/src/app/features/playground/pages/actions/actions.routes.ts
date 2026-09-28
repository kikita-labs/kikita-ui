import type { Routes } from '@angular/router';

import { PlaygroundRoute } from '@app/enums';
import { provideTranslocoScope } from '@jsverse/transloco';

export const PLAYGROUND_ACTIONS_ROUTES: Routes = [
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Button].join('/'),
    data: { componentId: PlaygroundRoute.Button },
    providers: [provideTranslocoScope('button')],
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
