import type { Routes } from '@angular/router';

import { AppRoute } from '@app/enums';

export const routes: Routes = [
  {
    path: AppRoute.Playground,
    loadChildren: () =>
      import('@features/playground-shell/playground-shell.routes').then(
        (route) => route.PLAYGROUND_SHELL_ROUTES,
      ),
  },
];
