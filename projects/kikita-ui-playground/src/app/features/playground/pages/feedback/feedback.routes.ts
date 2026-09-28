import type { Routes } from '@angular/router';

import { PlaygroundRoute } from '@app/enums';
import { provideTranslocoScope } from '@jsverse/transloco';

export const PLAYGROUND_FEEDBACK_ROUTES: Routes = [
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Badge].join('/'),
    data: { componentId: PlaygroundRoute.Badge },
    providers: [provideTranslocoScope('badge')],
    loadComponent: () => import('./badge').then((page) => page.Badge),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.EmptyState].join('/'),
    data: { componentId: PlaygroundRoute.EmptyState },
    providers: [provideTranslocoScope('empty-state')],
    loadComponent: () => import('./empty-state').then((page) => page.EmptyState),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Loader].join('/'),
    data: { componentId: PlaygroundRoute.Loader },
    providers: [provideTranslocoScope('loader')],
    loadComponent: () => import('./loader').then((page) => page.Loader),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Progress].join('/'),
    data: { componentId: PlaygroundRoute.Progress },
    providers: [provideTranslocoScope('progress')],
    loadComponent: () => import('./progress').then((page) => page.Progress),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Skeleton].join('/'),
    data: { componentId: PlaygroundRoute.Skeleton },
    providers: [provideTranslocoScope('skeleton')],
    loadComponent: () => import('./skeleton').then((page) => page.Skeleton),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Toast].join('/'),
    data: { componentId: PlaygroundRoute.Toast },
    providers: [provideTranslocoScope('toast')],
    loadComponent: () => import('./toast').then((page) => page.Toast),
  },
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.Tooltip].join('/'),
    data: { componentId: PlaygroundRoute.Tooltip },
    providers: [provideTranslocoScope('tooltip')],
    loadComponent: () => import('./tooltip').then((page) => page.Tooltip),
  },
];
