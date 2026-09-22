# Routing

- Route paths and route names are defined once as an enum, never repeated as string
  literals across the codebase. A route enum is multi-consumer by design — `.routes.ts`,
  `routerLink` in templates, `router.navigate()` calls, guards — so it never lives inside a
  `.routes.ts` file itself; it gets its own file under that scope's `enums/` kind-folder (see
  `folder-structure.md`) and `.routes.ts` imports it from there.

```ts
// app/enums/app-route.enum.ts
export enum AppRoute {
  Home = 'home',
  UserProfile = 'user/:id',
}
```

- Every feature under `features/<feature-name>/` owns its routes in a sibling
  `<feature-name>.routes.ts` — `app.routes.ts` never lists a feature's internal paths
  directly, it only points at that file via `loadChildren`. That feature's own route enum
  lives in its own `enums/` kind-folder, not inline in `<feature-name>.routes.ts`.

```ts
// features/user-profile/enums/user-profile-route.enum.ts
export enum UserProfileRoute {
  Root = '',
  Edit = 'edit',
}
```

```ts
// features/user-profile/user-profile.routes.ts
import { UserProfileRoute } from './enums';

export const USER_PROFILE_ROUTES: Routes = [
  {
    path: UserProfileRoute.Root,
    loadComponent: () => import('./pages/user-profile-view/user-profile-view'),
  },
  {
    path: UserProfileRoute.Edit,
    loadComponent: () => import('./pages/user-profile-edit/user-profile-edit'),
  },
];
```

Every component a route above loads lives under `pages/<page-name>/` — see
`architecture/folder-structure.md` for the full shape. A non-routed component the feature
uses internally (e.g. a card rendered inside `user-profile-view`) is never imported here;
it lives under `components/<component-name>/`, a sibling kind-folder of `pages/`, wired up
by the page component itself, not by the router.

```ts
// features/home/enums/home-route.enum.ts
export enum HomeRoute {
  Root = '',
}
```

```ts
// features/home/home.routes.ts
import { HomeRoute } from './enums';

export const HOME_ROUTES: Routes = [
  { path: HomeRoute.Root, loadComponent: () => import('./pages/home/home') },
];
```

```ts
// app.routes.ts
import { AppRoute } from './enums';

export const routes: Routes = [
  {
    path: AppRoute.Home,
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: AppRoute.UserProfile,
    loadChildren: () =>
      import('./features/user-profile/user-profile.routes').then((m) => m.USER_PROFILE_ROUTES),
  },
];
```

Even a single-route feature like `home` above still gets its own `<feature-name>.routes.ts`
and its entry component still lives under `pages/` — there is no exception for a feature
with just one route, on either count. `app.routes.ts` never calls `loadComponent` directly
on a feature's page; it only ever points at that feature's routes file via `loadChildren`.
This costs one small file per feature, but keeps every feature uniform (no "does this one
have a routes file or not" lookup) and means adding a second route to a feature later never
requires touching `app.routes.ts` — only that feature's own routes file. Angular's own
routing guide recommends this for the same reason: a route config that's minimal today
tends to grow, and a routing file for every feature is one less thing to restructure later.

- Navigation calls (`router.navigate`, `routerLink`) reference the enum, not a raw string.
- Lazy-load features with `loadChildren` — no eagerly-imported feature routes in
  `app.routes.ts`, and no `loadComponent` in `app.routes.ts` pointing at a feature's page
  directly.
- `app.routes.ts` stays a thin top-level map of feature entry points, each one a
  `loadChildren` pointer; it never grows to contain a feature's internal sub-routes — those
  belong in that feature's own `<feature-name>.routes.ts`.

## Review Checklist

- [ ] No raw route-path string literals outside the enum definition.
- [ ] A route enum never lives inline inside a `.routes.ts` file — it has its own file under
      that scope's `enums/` kind-folder, imported from `.routes.ts`.
- [ ] New feature routes are lazy-loaded.
- [ ] Every feature under `features/<feature-name>/` — including a single-route one — has
      its own `<feature-name>.routes.ts`, referenced from `app.routes.ts` via `loadChildren`.
      `app.routes.ts` never calls `loadComponent` on a feature's page directly.
