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

Representative routes:

- `/tokens`
- `/button`
- `/field`
- `/input`
- `/select`
- `/dropdown`
- `/popover`
- `/dialog`
- `/number-input`
- `/table`

Record any intentionally deferred SSR gap in `docs/state-coverage.md` or
`docs/component-roadmap.md`.
