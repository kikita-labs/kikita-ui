# Angular Code Style

Follow Angular 22 best practices and the local component rules.

## TypeScript

- Use strict types and avoid `any`; use `unknown` when a value is uncertain.
- Prefer inference when the type is obvious.
- Use explicit member visibility.
- Mark injected dependencies, signals, stable callbacks, and constants
  `readonly` unless reassignment is required.
- Do not use broad casts to compensate for weak API design.

## Angular

- Use standalone Angular APIs.
- Do not set `standalone: true`; it is the default.
- Do not add `ChangeDetectionStrategy.OnPush`; Angular 22 uses it by default.
- Use signal inputs, models, outputs, queries, and computed state.
- Prefer Signal Forms for new form-capable examples and controls.
- Use `inject()` instead of constructor injection.
- Use Angular 22 `@Service` for new services unless a documented DI pattern
  requires `@Injectable`.
- Use host metadata instead of `@HostBinding` and `@HostListener`.

## Naming

- A class is named for what it is, not for the construct that declares it. A directive or component
  class is the PascalCase of its selector: `button[kuiButton]` is `KuiButton`, `kui-tabs` is `KuiTabs`.
  No `Component`, `Directive` or `Service` suffix on any class, public or internal. This is the Angular
  20+ default (`ng generate`, Angular Material, CDK, Angular Aria) and `@Service` examples in the
  Angular 22 docs.
- A file is named after its class in kebab-case, without a construct infix: `kui-button.ts`,
  `kui-button.html`, `kui-button.css`, `kui-button.spec.ts`. A pipe keeps its role as a hyphenated
  word: class `KuiMarkPipe` in `kui-mark-pipe.ts`. Files that are not Angular constructs keep their
  role infix (`.interface.ts`, `.type.ts`, `.types.ts`, `.util.ts`, `.token.ts`, `.const.ts`).
- Provider functions are `provideKuiX`. Injection-context openers keep the `kuiX()` form
  (`kuiToast()`, `kuiDialog()`).
- When a new class name collides with an existing type, rename the construct that is not the
  selector's twin (for example the data interface `KuiChartLegendEntry` next to the directive
  `KuiChartLegendItem`) or give an internal class a role name (`KuiConfirmDialog`). Do not
  reintroduce a suffix, and do not rely on an import alias at the call site in the public API.
- A published export that is renamed or removed needs an entry in
  `projects/ui/schematics/ng-update/renames.json` (the `ng update` migration reads it), a row in
  `docs/migration-v2.md` or the guide of that major version, and a `CHANGELOG.md` entry.
- CSS class names are a separate namespace from exported symbols. CSS custom properties are the
  public theming contract; a class name is stable only where a component page documents it.

## Templates

- Use native control flow: `@if`, `@for`, and `@switch`.
- Keep templates simple and move derived values to `computed()`.
- Prefer native semantics before ARIA.
- Do not use `ngClass` or `ngStyle`; use class and style bindings.

## Services And State

- Keep services focused on one responsibility.
- Expose readonly signals and command methods.
- Use effects only for side effects close to the boundary.
- Do not copy one signal into another writable signal when `computed()` works.

## Comments and Public JSDoc

- Start public JSDoc with the observable contract. Add units, defaults,
  precedence, side effects, ownership, and deprecation details where relevant.
- Keep non-obvious invariants close to the code: Signal Forms collisions,
  hydration timing, numerical edge cases, and security constraints need reasons.
- Move incident histories and alternative-library comparisons to tracked design
  decisions when they remain useful. Preserve required license attribution.
- Do not enforce an arbitrary line limit or narrate obvious assignments.

Prefer `Viewport coordinates for pointer tooltips; element anchors for keyboard
focus` over a history of every tooltip bug. Prefer `Consumer owns removal; this
output only requests dismissal` over describing the event emitter implementation.
Use a short summary plus `@remarks` when a public contract needs extended detail.
