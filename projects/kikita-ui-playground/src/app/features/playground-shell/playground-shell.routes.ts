import type { Routes } from '@angular/router';

import { PlaygroundShellRoute } from './enums';

export const PLAYGROUND_SHELL_ROUTES: Routes = [
  {
    path: PlaygroundShellRoute.Root,
    loadComponent: () =>
      import('./pages/playground-shell/playground-shell').then((page) => page.PlaygroundShell),
    children: [
      {
        path: PlaygroundShellRoute.Root,
        loadChildren: () =>
          import('@features/playground/playground.routes').then((route) => route.PLAYGROUND_ROUTES),
      },
    ],
  },
];
