# Component Structure

## TypeScript

- Strict types. Avoid `any` — use `unknown` when a value is genuinely uncertain, then
  narrow it before use.
- Prefer inference when the type is obvious; don't annotate what TypeScript already knows.
- No broad casts (`as any`, `as unknown as X`) to paper over a weak type — fix the type
  instead.

## Visibility

- `public` — intentional class API, meant to be used from outside the component.
- `protected` — template-facing only; the template reads it, nothing outside the class
  should.
- `private` — internal implementation detail. Injected services are always `private` —
  see "Member order" item 3 below for how to expose what the template needs from one.
- Make injected dependencies, signals, inputs, outputs, and stable callbacks `readonly`
  unless reassignment is genuinely required.
- Signal APIs only: `input()`/`model()`/`output()`. The legacy `@Input()`/`@Output()`/
  `@ViewChild()`/`@ContentChild()` decorators are banned in new code — use `input()`,
  `model()`, `output()`, `viewChild()`, `contentChild()` instead.
- Host bindings/listeners use the `host` metadata object in `@Component`/`@Directive`, not
  the `@HostBinding()`/`@HostListener()` decorators.
- New forms use the Signal Forms API (`form()`, `[formField]`, and optionally
  `[formRoot]`). Keep Reactive Forms at existing or deliberately unsupported boundaries;
  use `compatForm`/`SignalFormControl` for migration. Use `ngModel` only for a genuinely
  standalone control with no form lifecycle. See `forms-and-inputs.md` for the full policy.
  - One form has **one** writable model signal holding the whole plain-object/array shape,
    wrapped once in `form()` — never one top-level `signal()` per field reassembled on submit.
    Give the model a named interface and initialize every rendered field; `undefined` removes
    a field from the `FieldTree`.

    ```ts
    protected readonly userModel = signal<UserFormModel>(USER_FORM_DEFAULT_STATE);

    protected readonly userForm = form(this.userModel, userFormSchema);
    ```

  - Bind each field with `[formField]` (`<input [formField]="userForm.name" />`) — never
    `[field]`, a manual `[value]`/`(input)` pair, or `[(ngModel)]` for a form field.
  - Put validation, conditional availability, and debounce rules in the form schema. Do not
    create competing `[disabled]`/`[readonly]` state sources on `[formField]` controls; native
    constraint attributes may be mirrored by Angular, but field state remains authoritative.
  - Render field errors with `@if` from `field().errors()` and `field().touched()`; do not
    rely on native `:valid`/`:invalid`, `validity`, or `validationMessage`.
  - Use `[formRoot]` with a real `type="submit"` button for native forms, or call `submit()`
    explicitly for a form outside a `<form>`. Return server errors with `fieldTree`, use
    `submitting()` to prevent duplicate work, and set `ignoreValidators: 'none'` when pending
    async validation must block a consequential submit.

- Use `inject()` for dependencies, not constructor-parameter injection — see the member
  order below; `inject()` calls are their own ordered group, constructor stays for actual
  initialization logic.

## Service Decorator

- New injectable service classes use Angular's `@Service` decorator, not `@Injectable`.
- Use `@Injectable` only when a specific DI pattern requires it (e.g. a documented edge
  case `@Service` doesn't support) — and note why in a comment when you do.

## Member order

Blank line between every group **and every subgroup** — including between the `protected`
half and `private` half of the same numbered group (e.g. between `protected readonly
signal()` fields and `private readonly signal()` fields). No two declarations from
different groups or subgroups ever sit on adjacent lines. A group/subgroup with nothing to
show is skipped, not left as an empty gap — never emit a blank line with nothing above or
below it.

```ts
readonly userId = input<string>();

readonly saved = output<void>();

private readonly http = inject(HttpClient);

private readonly userService = inject(UserService);

protected readonly staticValues = STATIC_VALUES;

private readonly localOnlyValue = 'x';

protected readonly guildId = signal('');

private readonly draftId = signal('');

protected readonly user = toSignal(this.userService.user$);

private readonly rawFeed = toSignal(this.feedService.feed$);

protected readonly isValid = computed(() => this.user() != null);
```

1. Inputs (`input()`/`model()`).
2. Outputs (`output()`).
3. `inject()` calls — always `private readonly`. If the template needs a value from an
   injected service, inject it `private`, then expose the needed slice further down as its
   own `protected readonly` (e.g. `protected readonly guildId = this.userService.guildId;`).
4. `protected readonly` plain fields, then `private readonly` plain fields.
5. `protected readonly signal()` fields, then `private readonly signal()` fields.
6. `protected readonly toSignal()` fields, then `private readonly toSignal()` fields.
7. `protected readonly linkedSignal()` fields, then `private readonly linkedSignal()`
   fields.
8. `protected readonly` resource (`resource()`/`rxResource()`/`httpResource()`) fields, then
   `private readonly` resource fields — prefer keeping the resource `private` and deriving a
   `computed()` (plus explicit loading/error state) from it instead of exposing the raw
   resource to the template.
9. `protected readonly form()` fields, then `private readonly form()` fields.
10. `protected readonly computed()` fields, then `private readonly computed()` fields.
11. `constructor()` — only when actually needed. Prefer extracting `effect()` bodies into a
    private method called from the constructor, instead of inlining the effect body.
12. Other lifecycle hooks, if unavoidable.
13. `protected readonly` arrow-function fields, if any (rare — prefer a method unless the
    template needs a bound reference).
14. `protected` methods, then `private` methods.

## Body formatting

- Group statements by purpose; blank line between groups, not inside one.
- Blank line before and after every `if` block.
- Collapse a single-statement `if` onto one line: `if (!user) return;`.
- Exception: a run of consecutive single-line guard `if`s (same shape, one condition/return
  each, no other statements between them) stays tight — no blank line between them, only
  before the first and after the last. The tight run reads as one decision table, not
  separate blocks.
- Blank line before `return`.

```ts
function example() {
  const a = 1;
  const b = 2;

  if (!b) return;

  if (a > b) {
    doSomething();
    doSomethingElse();
  }

  return a + b;
}
```

```ts
function statusToVariant(status: Status) {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED' || status === 'CANCELLED') return 'danger';
  if (status === 'IN_PROGRESS' || status === 'REPORT_PENDING') return 'warning';

  return 'info';
}
```

## Templates

- A signal (or any other call expression, e.g. a computed) read more than once in the same
  template gets bound to a local with `@let`, then every subsequent use reads the local, not
  the signal call again:

```html
@let userValue = user();

<h1>{{ userValue.name }}</h1>
<p>{{ userValue.email }}</p>
```

- A single use stays as a direct call — don't introduce `@let` pre-emptively.
- When the value being tested by `@if` is itself the value the block needs (e.g. a nullable
  signal read, checked for truthiness and then used), bind it with `@if (...; as x)` instead
  of re-reading the signal inside the block:

```html
@if (currentGuild.icon; as icon) {
<kui-avatar [src]="icon" [name]="currentGuild.name" size="lg" shape="square" />
}
```

## Folder structure

No `interface`, `type`, `enum`, or reusable `const` declared inline inside a component
file. If it needs to be exported for reuse, it goes in the matching subfolder:

```
componentName/
  interfaces/
    interface1.ts
    index.ts
  types/
    type1.ts
    index.ts
  constants/
    const1.ts
    index.ts
  enums/
    enum1.ts
    index.ts
  helpers/
    helper1.ts
    componentName.schema.ts  # only for a component that owns a Signal Form, see below
    index.ts
  services/
    service1.ts              # only for this component; shared services live at feature level
    index.ts
  tokens/
    token1.ts        # every token ships with a provider function alongside it
    index.ts
  componentName.ts
  componentName.html
  componentName.scss
  componentName.opener.ts   # only for a dialog/drawer-style component, see below
```

- A dialog or drawer component opened imperatively (@kikita-labs/ui (workspace source)'s dialog/drawer service, if
  one was chosen) gets a flat `componentName.opener.ts` sibling exporting a single
  `injectXxx()` function — this is the component's public "how to open it" API, not an
  internal implementation detail, so it stays flat next to `componentName.ts` rather than
  inside `helpers/` (`helpers/` is for logic extracted out of the component file for
  size/decomposition reasons).
- A component that owns a Signal Form has its schema function live in
  `helpers/componentName.schema.ts` (barrel-exported like any other helper), unlike
  `.opener.ts` above — the schema is only ever consumed by the component's own `form()`
  call, never imported by another component, so it's exactly the "logic extracted out of
  the component file" `helpers/` is for, not a public cross-component contract. See
  `forms-and-inputs.md` for what goes in it and where the form model's default-state
  constant goes instead (`constants/`, not the schema file).
- A service used only by one component lives in that component's `services/` subfolder. If two
  or more components in the feature use it, move it to the feature's `services/` folder; do
  not promote it to `shared/` unless another feature genuinely needs it.

- Decomposition is mandatory. Budgets: component/page TypeScript file ~150 lines target,
  200 hard-review threshold; template ~120 lines; stylesheet ~160 lines; a single function
  ~30 lines and one responsibility. Going over any of these means extract a helper,
  sub-component, or directive — don't just let it grow.
- Every subfolder gets a barrel `index.ts`.
- Component file names follow current Angular convention: no `.component` suffix
  (`user-card.ts`, not `user-card.component.ts`); name for what the thing is.
- The class name drops the suffix too, not just the file: `export class UserCard`, not
  `export class UserCardComponent`. This matches the Angular CLI's own `ng generate` default
  since v20 (the `addTypeToClassName` schematic option, defaulted off) — the file-only
  reading is a common misconception, and the CLI's actual generated code is the source of
  truth here, not just the style guide prose. Same rule for directives/pipes/services: no
  `Directive`/`Pipe`/`Service` suffix on the class either.
  - Known tradeoff: dropping the suffix on both file and class can produce a namespace
    collision (e.g. `User` the entity type vs. `User` the component class, both imported in
    the same file). Resolve it with an import alias at the call site
    (`import { User as UserCard } from './user-card'`) — don't reintroduce the suffix
    project-wide just to dodge one collision.

## Styling

- No hardcoded sizes or colors in component styles.

- Prefer @kikita-labs/ui (workspace source) primitives and its CSS variables first.
- Where no library covers it, use this project's own token scale — CSS custom properties
  (`var(--app-space-3)`, `var(--app-color-fg-muted)`) — never a raw px/hex
  value in a component stylesheet.
- Component styles live inside the `app.components` `@layer` — see
  `css-architecture.md` for the full layering rules.

- Prefer @kikita-labs/ui (workspace source) primitives first; they carry their own Tailwind-compatible classes/vars.
- Where no library covers it, use Tailwind utility classes in the template, reading from the
  `@theme` scale in `styles/tailwind.css` — never a raw px/hex value or an arbitrary-value
  bracket (`w-[13px]`) as a substitute for a missing token; add the token to `@theme` instead.
- No inline `[style]`/`style="..."` and no per-component stylesheet for anything utilities
  already cover. A `componentName.css` file is only for the rare rule Tailwind utilities
  genuinely can't express (e.g. a keyframe animation) — see `css-architecture.md`.

## Review Checklist

- [ ] No inline interface/type/enum/const meant for reuse.
- [ ] Member order matches the list above.
- [ ] No `@Input`/`@Output`/`@ViewChild`/`@ContentChild` decorators; signal equivalents used.
- [ ] No `@HostBinding`/`@HostListener`; `host` metadata object used instead.
- [ ] No constructor-parameter injection; `inject()` used instead.
- [ ] New forms use Signal Forms (`form()` + `[formField]`); `FormGroup`/`FormControl` and
      `ngModel` appear only at an intentional legacy or standalone boundary.
- [ ] One `form()` wraps one typed model signal for the whole form — not one `signal()` per
      field reassembled by hand; fields bind with `[formField]`, not `[field]`.
- [ ] Form submission uses `[formRoot]` or the `submit()` helper; server field errors are
      routed via `fieldTree` in the action's return, not a manual error signal.
- [ ] Async validation uses the correct debounce scope, and `ignoreValidators: 'none'` is set
      when pending validators must block a consequential submission.
- [ ] New service classes use `@Service`, not `@Injectable`, unless a documented DI edge
      case requires the latter.
- [ ] No `any`, no broad casts; `unknown` + narrowing used where the type is uncertain.
- [ ] Component TS ~150 lines target / 200 hard limit, template ~120, stylesheet ~160,
      each function ~30 lines and one responsibility — decompose if over.
- [ ] No hardcoded size/color values.
- [ ] Signal/computed called 2+ times in one template bound via `@let` instead of repeated
      calls.
- [ ] Value tested and used inside `@if` bound via `@if (...; as x)` instead of re-reading
      it.
- [ ] Every subfolder, including `services/` when present, has a barrel `index.ts`.
- [ ] Class name has no `Component`/`Directive`/`Pipe`/`Service` suffix, matching the file
      name convention — not just the file, the class too.
- [ ] Dialog/drawer component's `injectXxx()` opener is a flat `componentName.opener.ts`
      sibling, not tucked inside `helpers/`.
- [ ] Signal Form's schema function lives in `helpers/componentName.schema.ts`, not a flat
      sibling; the form model's default-state constant lives in `constants/`, not inline in
      the schema file or the component.
- [ ] Consecutive single-line guard `if`s of the same shape have no blank lines between
      them; blank line only before the first and after the last of the run.
