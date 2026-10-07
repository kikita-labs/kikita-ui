# SSR And Hydration

Kikita UI primitives must be safe in Angular SSR and hydration contexts. The
playground has SSR support only as a verification surface for the library; it is
not the public package runtime.

## Rules

- Do not access `window`, `document`, `navigator`, `HTMLElement`, observers, or
  timers at module top level.
- Use Angular DI tokens, platform checks, render hooks, or CDK utilities for DOM
  work.
- Avoid server-side DOM mutation that changes the compiled template shape before
  hydration.
- Browser-only enhancements must be skipped on the server and applied after the
  browser can safely own the DOM.
- Generated ids must be stable for the component lifecycle and must not duplicate
  across server and client render.

## Verification

Run SSR/hydration checks after changing:

- directives that wrap or move host DOM;
- overlays and portals;
- global providers or document styles;
- theme bootstrapping;
- form-field id and ARIA wiring;
- playground bootstrapping.

The SSR gate must build the playground with server output, serve it, load
representative routes in Playwright, and fail on hydration mismatch or console
errors.

An SSR check must prove three separate things, in this order:

1. The server response alone contains the route content (`request.get`, or a page with
   `javaScriptEnabled: false`).
2. The same DOM survives hydration. Use `openWithHeldScripts` from `projects/kikita-ui-playground/e2e/support/ssr.ts` to hold
   every client script, mark a server-rendered node, release the scripts, and assert the marked node
   is still there.
3. The hydrated page stays interactive. The Playground exposes no hydration marker, so prove it with
   an idempotent client-only action such as switching the theme (`waitForShellHydration`).

The Playground's own `dist/kikita-ui-playground/server/server.mjs` serves both the server-rendered
HTML and the client scripts, so the SSR gate runs against it directly. The SSR gate rebuilds first,
refuses a stale build, and never reuses an already running server.

`projects/kikita-ui-playground/e2e/component-pages.spec.ts` renders every component route on the
server and hydrates it. `projects/kikita-ui-playground/e2e/ssr-hydration.spec.ts` holds the deeper
checks (held scripts, event replay, server ids, time zones and locale). Each page spec adds its own
SSR check for behavior the page owns.

Record any intentionally deferred SSR gap in `docs/state-coverage.md` or
`docs/component-roadmap.md`.

Rules for render-time values:

- Never keep an id counter, clock or locale in module scope. Module state outlives a request, so
  server ids and dates depend on earlier requests. Use `kuiNextId` / `kuiIdFactory` for ids and
  `KuiClock` for "today" and initial months.
- Never read the host's locale on the server. `KUI_LOCALE` comes from the request's `Accept-Language` and reaches the browser through `TransferState`; cache the server output with `Vary: Accept-Language`. Components read the locale and the library messages through `KuiI18n`; its formatter caches live in the instance, never in module scope, and an unsupported tag falls back to `en-US` instead of the host's default locale.
- A value that differs between server and browser must render identically first. Hydration does not
  remove a class or attribute the server set and the browser's first evaluation leaves unset.

The audit register is `docs/ssr-lifecycle-register.md`.
