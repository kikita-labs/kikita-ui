# RxJS vs Signals

- Signals are the default for reactive state. Prefer `signal()`, `computed()`,
  `rxResource()`/`httpResource()` over RxJS for state and data fetching.
- RxJS is still the right tool for one-shot mutations (POST/PATCH/PUT/DELETE) triggered by
  a user action, where a resource doesn't fit.
- Never call `.subscribe({ next, error })` for a mutation. Put error handling and cleanup
  in the pipe and subscribe with a plain callback:

```ts
this.userService
  .save(user)
  .pipe(
    catchError(() => {
      this.error.set('Save failed');
      return of(null);
    }),
    finalize(() => this.saving.set(false)),
  )
  .subscribe((result) => {
    if (result) this.saved.set(true);
  });
```

- Don't use a `Subject` as a state store — that's what `signal()` is for.
- Reading a reactive route param: use `toSignal(route.paramMap)`, never
  `route.snapshot.paramMap.get(...)` as a field initializer — it goes stale when the router
  reuses the component instance across a params-only navigation.
- Always clean up manual subscriptions with `takeUntilDestroyed()` if you can't avoid
  subscribing directly.
- TypeScript doesn't narrow a signal call across repeated invocations — each call is a fresh
  function call that could return a different value, so `if (this.signal1())` does not make
  a later `this.signal1()` non-null. Read a signal more than once in a function (or test it
  in an `if`), and bind it to a local first:

```ts
const value = this.signal1();
if (value) value.field;
```

## Resource State

- `resource()`/`rxResource()`/`httpResource()` already expose `isLoading()`, `error()`,
  `hasValue()`, and `value()` — never hand-roll a parallel `loading`/`error` signal that you
  set/clear yourself around the call. That's re-implementing state the resource already
  tracks, and it drifts out of sync with the resource's real status.
- Keep the resource itself `private`; expose what the template needs as `protected readonly`
  `computed()`s built on top of it, so the template reads a signal, not the resource's raw
  API surface:

```ts
private readonly userResource = rxResource({ loader: () => this.userApi.getUser() });

protected readonly user = computed(() =>
  this.userResource.hasValue() ? this.userResource.value() : null,
);
protected readonly isLoading = computed(() => this.userResource.isLoading());
protected readonly loadError = computed(() => this.userResource.error());
```

- Same goes for the fetch itself: never hand-write a `private reloadX()` method that reads
  signals, guards on them being set, and does `.pipe(catchError, finalize).subscribe(this.x.set)`
  — that's a resource, manually reimplemented. Give the resource reactive `params` built from
  the same signals and call `.reload()` (or just let a `params()` change re-trigger it):

```ts
private readonly detailsResource = rxResource({
  params: () => {
    const guildId = this.guildId();
    const memberId = this.selectedMemberId();
    return guildId && memberId ? { guildId, memberId } : undefined;
  },
  loader: ({ params }) =>
    this.missionsApi.getPlayerDetails(params.guildId, params.memberId).pipe(
      catchError(() => {
        this.errorMessage.set(this.transloco.translate('details.failed'));
        return of(null);
      }),
    ),
});

protected readonly details = computed(() => this.detailsResource.value());
protected readonly loadingDetails = computed(() => this.detailsResource.isLoading());

// to force a refetch with the same params, e.g. after a mutation:
this.detailsResource.reload();
```

- In the template, read `isLoading()`/`loadError()`/`user()` directly (with `@let` if a
  given one is used more than once — see `component-structure.md`) instead of introducing
  a fourth signal that mirrors combined state.

## Service Shape

- One responsibility per service — a service that both fetches user data and manages
  toast notifications is two services wearing one name.
- Expose `readonly` signals for state and plain methods for commands (`save()`,
  `refresh()`) — never expose a raw `WritableSignal` for external code to `.set()` directly:

  ```ts
  private readonly _items = signal<readonly Item[]>([]);
  readonly items = this._items.asReadonly();

  setItems(items: readonly Item[]): void {
    this._items.set(items);
  }
  ```

  A public field typed `WritableSignal<T>` on a service is always wrong — it hands every
  consumer `.set()`/`.update()`, bypassing whatever invariant the service's own methods
  enforce.

- Use `effect()` only for actual side effects at a system boundary (syncing to
  `localStorage` via a platform adapter, logging, analytics) — not as a way to compute one
  piece of state from another. If you're tempted to `effect(() => this.b.set(f(this.a())))`,
  use `computed()` instead.
- Never copy one signal's value into another writable signal when `computed()` already
  expresses the relationship — that's a stale-state bug waiting to happen.

## API/HTTP Service Shape

- A service whose only job is talking to the backend (building requests, calling
  `HttpClient`, returning the raw response/observable — no derived state, no business
  logic) is named `<domain>-api.service.ts`, class `<Domain>Api` (no `Service` suffix on
  the class, per `component-structure.md`'s naming rule) — `guilds-api.service.ts` →
  `GuildsApi`, where `<domain>` matches the API route section it wraps (`/guilds/...` →
  `guilds-api.service.ts`).
- A service that holds state/signals or orchestrates logic keeps the plain
  `<domain>.service.ts` name, no `-api`/`-http` marker — that marker exists specifically to
  flag "this one is HTTP-only, nothing else."
- Always split the two: a service that both calls HTTP and manages derived state/signals is
  two services wearing one name (same reasoning as "One responsibility per service" above).
  The logic/state service depends on the `-api` service, not the other way around, and the
  `-api` service is the only one injecting `HttpClient`.
- An `-api.service.ts` declares a `private readonly` constant for its endpoint prefix, and
  every method builds its path off it — never repeat the literal path segment across
  methods:

```ts
@Service()
export class GuildsApi {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/guilds';

  getGuild(guildId: string) {
    return this.http.get<Guild>(`${this.basePath}/${guildId}`);
  }

  getMembers(guildId: string) {
    return this.http.get<GuildMember[]>(`${this.basePath}/${guildId}/members`);
  }
}
```

- If a domain ends up with several services that are really one unit from a consumer's
  point of view (e.g. `guilds-api.service.ts` + `guilds.service.ts` state/logic, or several
  narrow services split by sub-concern), and components would otherwise have to inject and
  coordinate all of them individually, add a `<domain>-facade.service.ts` / `<Domain>Facade`
  in front of them only when that coordination is actually needed by more than one call
  site — it exposes the combined public API, delegates to the underlying services, and is
  what features inject instead of the individual pieces. Don't add a facade speculatively
  for a domain that's still just one or two services with no real coordination to hide.

## Cross-Feature State

State that's genuinely shared across features (not just reused UI) lives in a `@Service`
under `core/`, exposing `readonly` signals per the Service Shape rules above — this is the
default. Do not reach for NgRx or a similar external store unless the project has grown
enough state, with enough cross-cutting update logic, that a plain signal-service can no
longer keep it manageable — that's a decision worth an ADR (see `../decisions/README.md`,
"state ownership"), not something to pull in speculatively at scaffold time.

## Review Checklist

- [ ] State is signals/computed/resource-based, not an RxJS store.
- [ ] No hand-rolled `loading`/`error` signal duplicating a resource's own `isLoading()`/
      `error()`; resource stays `private`, template reads `protected readonly computed()`s
      built on the resource's native state.
- [ ] No hand-written `reloadX()`/`fetchX()` method wrapping `subscribe` — use a resource's
      reactive `params` + `.reload()` instead.
- [ ] Mutations use pipe-based error handling, not `.subscribe({ next, error })`.
- [ ] No `Subject` used as a state store.
- [ ] Reactive route params use `toSignal`, not a snapshot field initializer.
- [ ] Signal read 2+ times in one function (or tested in an `if`) is bound to a local first,
      not re-called.
- [ ] Services expose readonly signals + command methods, not raw writable signals.
- [ ] No signal-copying where `computed()` would do; `effect()` used only for boundary
      side effects.
- [ ] HTTP-only service named `<domain>-api.service.ts`; logic/state service stays
      `<domain>.service.ts` — not merged into one class.
- [ ] `-api.service.ts` has a `private readonly` endpoint-prefix constant; methods build off
      it instead of repeating the literal path.
- [ ] Facade service (`<domain>-facade.service.ts`) exists only where multiple services in
      one domain genuinely need coordinating for more than one call site — not added
      speculatively.
