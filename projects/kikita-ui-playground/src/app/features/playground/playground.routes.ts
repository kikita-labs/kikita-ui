import type { Routes } from '@angular/router';

import { PlaygroundRoute } from '@app/enums';

import { PLAYGROUND_ACTIONS_ROUTES } from './pages/actions';
import { PLAYGROUND_DATA_IDENTITY_ROUTES } from './pages/data-identity';
import { PLAYGROUND_FEEDBACK_ROUTES } from './pages/feedback';
import { PLAYGROUND_FORMS_ROUTES } from './pages/forms';
import { PLAYGROUND_SURFACES_ROUTES } from './pages/surfaces';

export const PLAYGROUND_ROUTES: Routes = [
  {
    path: PlaygroundRoute.Root,
    pathMatch: 'full',
    loadComponent: () => import('./pages/home').then((page) => page.PlaygroundHome),
  },
  ...PLAYGROUND_ACTIONS_ROUTES,
  ...PLAYGROUND_DATA_IDENTITY_ROUTES,
  ...PLAYGROUND_FEEDBACK_ROUTES,
  ...PLAYGROUND_FORMS_ROUTES,
  ...PLAYGROUND_SURFACES_ROUTES,
  {
    path: [PlaygroundRoute.Components, PlaygroundRoute.ComponentId].join('/'),
    loadComponent: () =>
      import('./pages/component-playground').then((page) => page.ComponentPlayground),
  },
];
