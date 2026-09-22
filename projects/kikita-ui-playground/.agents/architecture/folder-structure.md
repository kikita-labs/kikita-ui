# Folder Structure

```
public/             # served at the site root as-is (favicon.ico, robots.txt, manifest) —
                     # no import path, referenced by absolute URL (e.g. /favicon.ico)
src/
  assets/            # static files referenced from code/templates, served under /assets —
                      # images grouped by domain (assets/<domain>/), not dumped flat
  app/
    core/            # app-wide singletons: guards, interceptors, root services, tokens
      guards/        # route guards (CanActivateFn, etc.)
      interceptors/  # HttpInterceptorFn functions
      services/      # app-wide singleton services (@Service, providedIn: root)
      tokens/        # InjectionToken/HttpContextToken used by core code, even single-consumer
      platform/      # SSR-safe browser-API adapters, if SSR was chosen — see platform-adapter.md
    shared/
      ui/            # reusable components/directives/pipes — see .agents/shared/README.md
      utilities/     # framework-agnostic helper functions — no Angular imports
    features/
      <feature-name>/
        <feature-name>.routes.ts   # feature's own routes — see routing.md
        interfaces/        # only for a piece shared by 2+ components within this feature —
        types/              # a single component's own interface/type/etc stays co-located
        constants/           # inside that component's own subfolder instead (see below)
        enums/
        helpers/
        services/            # feature-scoped services used by 2+ of this feature's components
        pages/
          <page-name>/        # entry component — loaded by <feature-name>.routes.ts
            interfaces/
            types/
            constants/
            enums/
            helpers/
            services/          # services used only by this page component
            tokens/
            <page-name>.ts
            <page-name>.html
            <page-name>.scss
        components/
          index.ts             # aggregator barrel — explicit named re-exports of each
                                # <component-name>/ barrel below, see aliases-and-barrels.md
          <component-name>/    # non-routed component, used within this feature
            interfaces/
            types/
            constants/
            enums/
            helpers/
            services/          # services used only by this component
            tokens/
            <component-name>.ts
            <component-name>.html
            <component-name>.scss
    enums/           # app-wide enums (e.g. AppRoute) — not tied to one feature, see routing.md
    app.routes.ts
    app.config.ts
  styles/

    layers.scss  # @layer order declaration, imported first

    typography.scss  # typography tokens (font-size/line-height/weight), see css-architecture.md

    mixins/          # SCSS mixins/functions — see css-architecture.md
  environments/      # non-secret, per-target build config (API base URL, feature flags)
```

- `environments/` holds non-secret, build-time config that differs per target (dev/prod
  API base URL, feature-flag defaults) — verify the current Angular CLI's actual
  mechanism for this (`fileReplacements` in `angular.json`, or its current equivalent)
  rather than assuming an older pattern still applies. Real secrets (API keys, tokens)
  never go here or anywhere tracked — they come from environment variables / CI secrets
  at deploy time, injected outside the repo. See `.env`/`.env.*` handling in
  `../git-policy.md`.

- `public/` vs `src/assets/` — two different jobs, both wired in `angular.json`'s `assets`
  config (verify the current Angular CLI's actual copy paths rather than assuming):
  - `public/` is for files the browser or a crawler expects at a fixed root URL —
    `favicon.ico`, `robots.txt`, a web manifest. Nothing in app code imports from here by
    path; it's referenced by absolute URL only.
  - `src/assets/` is for static files the app references from code or templates —
    images, locale JSON if i18n is used. Group by domain under `assets/<domain>/` rather
    than dumping every file flat into `assets/`.

- `app.routes.ts` and `app.config.ts` stay directly under `src/app/`, next to the root
  component — this is the Angular CLI's own default layout and what `ng generate`
  schematics expect. Don't nest them under a `bootstrap/` folder; that adds indirection
  with no benefit for a single-app project (it would only start paying off in a multi-app
  monorepo, which this skill doesn't support — see `SKILL.md`).
- `app/enums/` holds enums with no single feature owner — `AppRoute` is the main example.
  It's multi-consumer by nature (`app.routes.ts`, `routerLink`, `router.navigate()`, guards),
  so it never lives inline in `app.routes.ts` — see `routing.md`. A feature-scoped route enum
  (`UserProfileRoute`, etc.) follows the same reasoning one level down, in that feature's own
  `enums/` kind-folder — not in `app/enums/`, and not inline in `<feature-name>.routes.ts`.
- `shared/` splits by dependency shape, not just "reusable": `ui/` holds anything with an
  Angular decorator (component, directive, pipe) — template-facing, DI-aware. `utilities/`
  holds plain functions/classes with zero Angular imports — anything under `core/`,
  `shared/ui/`, or `features/` can depend on a utility, but a utility never depends back on
  Angular. Don't blend the two into one folder; the import direction is exactly what an
  ESLint restricted-import rule needs to enforce automatically (see
  `../testing-and-quality.md`).
- SCSS mixins/functions (if SCSS was chosen) live in `styles/mixins/`, not under
  `app/shared/` — they're not TypeScript and aren't part of the `shared/ui`/`shared/
utilities` import-boundary story. The pattern isn't limited to mixins: any grouped set of
  tokens that needs its own file (layer order, typography) lives under `styles/`, imported
  once from the entrypoint — see `css-architecture.md`.

- Design tokens (if Tailwind was chosen) live in the `@theme` block of `styles/tailwind.css`,
  not scattered across component files — see `css-architecture.md`.
- A feature is a business domain (e.g. `user-profile`, `cart`, `missions`), not a UI
  component — it's the unit that owns a URL sub-tree and a chunk of the domain, and it can
  hold several components inside it. Don't create a `features/<x>/` folder per component;
  group components that serve one domain under one feature folder instead.
- A feature owns its own components; nothing under `features/<x>/` is imported by another
  feature directly — promote it to `shared/ui/` or `shared/utilities/` first, with a doc
  entry, if it needs reuse.
- Every component inside a feature — routed or not — gets its own `<name>/` folder with the
  same internal shape (`interfaces/`, `types/`, etc. next to `<name>.ts`). There is no flat
  exception for the component a feature's route loads; it's a component like any other, just
  the one wired up in `<feature-name>.routes.ts`.
- `components/` gets its own aggregator `index.ts`, re-exporting each `<component-name>/`
  barrel with explicit named exports (never `export *` — same rule as any other barrel, see
  `aliases-and-barrels.md`). This is the one kind-folder that gets an aggregator on top of
  its leaf barrels — reusable components are imported often enough across a feature's pages
  and other components that a single import path (`from '../components'`) pays for itself.
  `pages/` deliberately does **not** get this: each page is wired into
  `<feature-name>.routes.ts` via `loadComponent: () => import(...)` on its own file path —
  an aggregator barrel would force a static import of every page into one chunk and defeat
  that lazy-loading.
- `pages/<page-name>/` holds the components a feature's routes actually load — the entry
  points. Everything else the feature needs (a table, a card, a modal body) is a
  `<component-name>/` folder under a sibling `components/` kind-folder, next to `pages/`,
  not inside it. `components/` mirrors `pages/` and the other feature-root kind-folders
  (`services/`, `interfaces/`, etc.) — every kind of feature-root content gets its own
  folder, none of it sits flat. This is the one structural signal that tells `pages/` and
  regular components apart; don't also rename entry components with a `-page` suffix on
  top of the `pages/` folder — the folder location already says what it is, a suffix would
  just repeat the same fact twice.
- A feature-root subfolder (`interfaces/`, `types/`, `constants/`, `enums/`, `helpers/`,
  `services/`) is only for something genuinely shared by 2+ components within that one
  feature — a `missions-api.service.ts` used by both a page and a table, for instance. If
  only one component uses it, it stays co-located inside that component's own subfolder
  instead; promoting single-consumer code to the feature root just to "be safe" adds a level
  of indirection nobody needs. If it turns out another _feature_ needs it too, that's a
  `shared/` promotion (with a doc entry), not a feature-root one — feature-root subfolders
  are for intra-feature reuse only, never a way to dodge the `shared/` registry.
- `core/` is for things that exist exactly once for the whole app (auth interceptor, root
  error handler) — not a dumping ground for "things that didn't fit elsewhere". Split by
  kind, same reasoning as the `shared/ui`/`shared/utilities` split: `guards/`,
  `interceptors/`, `services/`, `tokens/` (plus `platform/` if SSR). Don't leave singleton files flat
  directly under `core/` once there's more than one of a kind — one guard and one service
  in two different flat files is still "two kinds", not "not enough to bother splitting".
- One responsibility per service (see `code-style/rxjs-and-signals.md`, "Service Shape") —
  a service that wraps HTTP calls for three unrelated domains is three services wearing one
  name. Split a growing HTTP-client service by domain (e.g. `user-api.service.ts`,
  `missions-api.service.ts`) once it's doing more than one thing, even though every one of
  them still lives in `core/services/` — this is a file-organization split, not a
  layer-direction change, so it doesn't need an ADR by itself.

## Review Checklist

- [ ] New shared component/directive/pipe lives in `shared/ui/`, new framework-agnostic
      helper lives in `shared/utilities/` — not mixed.
- [ ] Nothing under `shared/utilities/` imports from `@angular/*`.
- [ ] `app.routes.ts`/`app.config.ts` stay at `src/app/`, not moved into a `bootstrap/`
      folder.
- [ ] App-wide enums (e.g. `AppRoute`) live in `app/enums/`, not inline in `app.routes.ts`;
      feature-scoped route enums live in that feature's own `enums/`, not inline in
      `<feature-name>.routes.ts`.
- [ ] Feature with its own routes has `<feature-name>.routes.ts` inside its folder — see
      `routing.md` — not routes inlined in `app.routes.ts`.
- [ ] Every component in a feature — including the one(s) loaded by its routes — has its own
      `<name>/` folder; no component's files sit flat directly under the feature root.
- [ ] Routed entry components live under `pages/<page-name>/`; non-routed components live
      under `components/<component-name>/`, a sibling kind-folder of `pages/`, not nested
      inside it and not flat in the feature root.
- [ ] `components/` has its own aggregator `index.ts` with explicit named exports of each
      `<component-name>/` barrel; `pages/` does not have one.
- [ ] A feature-root subfolder (`interfaces/`, `services/`, etc.) exists only for code shared
      by 2+ components of that feature — single-consumer code stays co-located in its own
      component instead, and cross-feature reuse goes through `shared/` with a doc entry.
- [ ] Nothing added to `core/` that isn't a genuine app-wide singleton concern; guards,
      interceptors, and services each live in their own `core/<kind>/` subfolder.
- [ ] No service mixes more than one unrelated responsibility — split by domain instead.
- [ ] No secret value committed under `environments/` or anywhere else tracked — secrets
      come from env vars/CI secrets, never from a file in the repo.
- [ ] Root-URL files (favicon, robots.txt, manifest) go in `public/`; code/template-
      referenced static files go in `src/assets/`, grouped by domain, not dumped flat.
