# Platform Adapter (SSR Safety)

Present only because this project is server-rendered. Delete this file (and its
`architecture/README.md` link) if SSR was declined.

- Outside `core/platform/**`, direct access to `window`, `document`, `navigator`,
  `localStorage`/`sessionStorage`, `ResizeObserver`/`IntersectionObserver`, `history`,
  `location`, or timer globals (`setTimeout` at module scope) is forbidden. These don't
  exist during server rendering and will break SSR or hydration if touched at the wrong
  time.
- Each capability gets its own adapter under `core/platform/` (e.g. `clipboard.ts`,
  `viewport.ts`, `storage.ts`), injected like any other service. Components and features
  depend on the adapter, never on the global directly.
- A platform adapter is a core singleton like any other — register it in
  `../core/README.md` (`Kind: service`) when you add one. See `../documentation.md`.
- No browser-global access at module top level (outside a function/constructor body) —
  that code runs during server rendering too.
- Use stable, deterministic IDs for anything that must match between server-rendered HTML
  and the client hydration pass (no `Math.random()`/`Date.now()` in template-bound IDs).
- Do not mutate server-rendered DOM in a way that changes the compiled template shape
  before hydration — that causes a hydration mismatch.
- For a browser-only enhancement that has to run after the DOM is real (measuring an
  element, focusing something, initializing a third-party widget), use `afterNextRender()`
  or `afterRenderEffect()` — these are the sanctioned render hooks; they no-op on the
  server and run once the browser owns the DOM. Don't reach for `setTimeout(fn, 0)` as a
  substitute.

```ts
@Service({ providedIn: 'root' })
export class ClipboardAdapter {
  private readonly platformId = inject(PLATFORM_ID);

  copy(text: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    navigator.clipboard.writeText(text);
  }
}
```

## Review Checklist

- [ ] No direct browser-global access outside `core/platform/**`.
- [ ] No browser-global access at module top level.
- [ ] IDs used in SSR-rendered templates are deterministic, not random per-render.
- [ ] Post-hydration DOM work uses `afterNextRender()`/`afterRenderEffect()`, not
      `setTimeout` or direct top-level access.
- [ ] Every adapter is registered in `../core/README.md`.
