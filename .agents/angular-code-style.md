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
