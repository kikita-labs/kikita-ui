import type { Routes } from '@angular/router';

import { PlaygroundRoute } from '@app/enums';
import { provideTranslocoScope } from '@jsverse/transloco';

export const PLAYGROUND_DATA_IDENTITY_ROUTES: Routes = [
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Avatar].join('/'),
    data: { componentId: PlaygroundRoute.Avatar },
    providers: [provideTranslocoScope('avatar')],
    loadComponent: () => import('./avatar').then((page) => page.Avatar),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Chip].join('/'),
    data: { componentId: PlaygroundRoute.Chip },
    providers: [provideTranslocoScope('chip')],
    loadComponent: () => import('./chip').then((page) => page.Chip),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Icon].join('/'),
    data: { componentId: PlaygroundRoute.Icon },
    providers: [provideTranslocoScope('icon')],
    loadComponent: () => import('./icon').then((page) => page.Icon),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Scrollbar].join('/'),
    data: { componentId: PlaygroundRoute.Scrollbar },
    providers: [provideTranslocoScope('scrollbar')],
    loadComponent: () => import('./scrollbar').then((page) => page.Scrollbar),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Table].join('/'),
    data: { componentId: PlaygroundRoute.Table },
    providers: [provideTranslocoScope('table')],
    loadComponent: () => import('./table').then((page) => page.Table),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Tree].join('/'),
    data: { componentId: PlaygroundRoute.Tree },
    providers: [provideTranslocoScope('tree')],
    loadComponent: () => import('./tree').then((page) => page.Tree),
  },
];
