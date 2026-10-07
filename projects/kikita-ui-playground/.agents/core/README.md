# Core

Registry of `src/app/core/` singletons: app-wide services, guards, interceptors, and tokens
that exist exactly once for the whole app. Not a dumping ground for "things that didn't fit
elsewhere" — see `../architecture/folder-structure.md` for the boundary between `core/` and
`shared/`.

## Registry

| Name           | Kind    | Path                       | Doc | Summary                                                                                                                                                  |
| -------------- | ------- | -------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| StorageAdapter | service | `core/platform/storage.ts` |     | SSR-safe `localStorage` access (`read`, `write`, `remove`); no-op on the server and when the browser blocks storage. Used by the playground preferences. |

Kind is one of: `service`, `guard`, `interceptor`, `token`.

An `InjectionToken`/`HttpContextToken` used by app-wide code (an interceptor, a core service)
is `kind: token`, path `core/tokens/<name>.token.ts` — even if only one consumer uses it
today. Don't colocate a token file inside `interceptors/`/`services/`; `tokens/` is its own
kind, same as guards or services.

## Adding an entry

1. Build it under `src/app/core/<kind>/` (`guards/`, `interceptors/`, `services/`, or
   `tokens/` — see `../architecture/folder-structure.md`).
2. Add a row to the table above.
3. If it has a non-trivial API or wiring (e.g. an interceptor's behavior, a service's
   public methods), create `.agents/core/<name>.md`. Simple guards/services can rely on the
   table row alone.

This applies every time a core singleton is added, changed, or removed — see
`../documentation.md`.

## Review Checklist

- [ ] Table has no stale or missing entries.
- [ ] Nothing here that's actually feature-scoped or reusable-but-not-singleton — that
      belongs in `../shared/README.md` instead.
