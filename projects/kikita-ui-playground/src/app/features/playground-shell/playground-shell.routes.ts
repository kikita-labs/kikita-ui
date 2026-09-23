import type { Routes } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';

import { PlaygroundShellRoute } from './enums';

export const PLAYGROUND_SHELL_ROUTES: Routes = [
  {
    path: PlaygroundShellRoute.Root,
    loadComponent: () =>
      import('./pages/playground-shell/playground-shell').then((page) => page.PlaygroundShell),
    children: [
      {
        path: PlaygroundShellRoute.Root,
        pathMatch: 'full',
        loadComponent: () =>
          import('./components/workspace-placeholder/workspace-placeholder').then(
            (page) => page.WorkspacePlaceholder,
          ),
      },
      {
        path: [PlaygroundShellRoute.Components, PlaygroundShellRoute.Button].join('/'),
        data: { componentId: PlaygroundShellRoute.Button },
        providers: [provideTranslocoScope('button')],
        loadComponent: () => import('./pages/button').then((page) => page.Button),
      },
      {
        path: [PlaygroundShellRoute.Components, PlaygroundShellRoute.ComponentId].join('/'),
        loadComponent: () =>
          import('./pages/component-playground/component-playground').then(
            (page) => page.ComponentPlayground,
          ),
      },
    ],
  },
];
