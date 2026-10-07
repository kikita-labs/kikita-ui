# Forms and Inputs

Angular Signal Forms (available in Angular v21 and stable since v22,
`@angular/forms/signals`) are the default for new forms: a named group of fields with
validation, submission, or cross-field rules. Angular Reactive Forms remain a valid choice
for an existing codebase, an unsupported integration, or a deliberate stability constraint;
use the interop rules below instead of mixing both APIs on the same field by accident.
Reach for `ngModel` only for a genuinely standalone control with no form lifecycle around it.
Never wire up a form control by hand with `(change)`/`(input)` plus manual `event.target`
casting — that reimplements `[formField]` or `ngModel` poorly.

```ts
// Wrong — manual event handling, no reason for it to exist
<input kuiCheckbox type="checkbox" [checked]="dontAskAgain()" (change)="onDontAskAgainChange($event)" />
protected readonly onDontAskAgainChange = (event: Event) => {
  this.dontAskAgain.set((event.target as HTMLInputElement).checked);
};
```

```ts
// Right — single standalone toggle, not part of a form: signal stays a signal
protected readonly dontAskAgain = signal(false);
```

```html
<input
  kuiCheckbox
  type="checkbox"
  [ngModel]="dontAskAgain()"
  (ngModelChange)="dontAskAgain.set($event)"
/>
```

`FormsModule`'s `[(ngModel)]` banana-in-box sugar desugars to
`[ngModel]="x" (ngModelChange)="x = $event"` — a plain reassignment, not a `.set()` call.
`ngModel` itself has no signal-aware two-way binding (unlike a component's own `model()`
input) — binding the sugar form directly to a `WritableSignal` either fails to type-check
or silently clobbers the signal reference on change (tracked upstream:
[angular/angular#61419](https://github.com/angular/angular/issues/61419),
[#57771](https://github.com/angular/angular/issues/57771)). Don't work around this by
demoting the field to a plain mutable property — expand the sugar by hand into
`[ngModel]` + `(ngModelChange)` instead, calling `.set()` explicitly. The control's state
stays a signal like everywhere else in the codebase, and `ngModelChange` already emits the
typed value (`boolean` for a checkbox) — no `event.target` cast needed either.

```ts
// Right — this is a form: Signal Forms owns it end to end
<input kuiCheckbox type="checkbox" [formField]="preferencesForm.dontAskAgain" />
```

## When to Use What

- **Signal Forms (`form()` + `[formField]`)** — any input that's part of a new form: 2+ related
  fields, anything with validation, anything with a submit action, anything with
  cross-field or conditional (disabled/hidden/readonly) rules. This is the default; reach
  for it first.
- **`[(ngModel)]`** — a genuinely standalone control with no group, no validation, and no
  submit step around it (a single settings toggle, a filter checkbox next to a list). Don't
  build a one-field `form()` just to avoid `ngModel` here — that's the opposite mistake.
- **Reactive Forms** — keep them at existing boundaries when migration cost or a library
  integration justifies it. Do not introduce a new `FormGroup`/`FormControl` for a form that
  Signal Forms can model; use `compatForm` or `SignalFormControl` for gradual migration.
- **Never**: a manual `(change)`/`(input)` listener that reads `event.target` and casts it,
  for either of the above cases. If you're casting `event.target as HTMLInputElement`,
  something above should have been `[formField]` or `ngModel` instead.

## Building a Signal Form

`form()` takes a writable model **signal** and returns a `FieldTree` that mirrors the model's
shape. Keep the model as the single source of truth and type it with a named interface —
never an inline object type — placed per
`../architecture/folder-structure.md` (a feature-root `interfaces/` folder if shared by 2+
components in that feature, otherwise co-located in the owning component's own
`interfaces/` subfolder; promote to `shared/` only on genuine cross-feature reuse).

The structural layer of the model must use plain objects and arrays. Translate class
instances, `Map`, and `Set` values into plain form data at the domain boundary; Signal Forms
walks object keys to build the field tree and does not preserve class prototypes.

```ts
// interfaces/user-profile-form.interface.ts
export interface UserProfileFormModel {
  readonly name: string;
  readonly email: string;
  readonly age: number;
}
```

The schema function itself lives in `helpers/componentName.schema.ts` — see
`component-structure.md`'s folder structure section. Unlike `componentName.opener.ts`
(consumed by other components, so it stays a flat public sibling), a schema is only ever
consumed by its own component's `form()` call — exactly the "logic extracted out of the
component file" `helpers/` exists for.

Give the model a default-state constant in the component's own `constants/` subfolder
instead of inlining the initial object in the component (or the schema file). This keeps a
single source of truth to `.set()`/`reset()` back to later, instead of re-typing the
same literal object wherever the form needs resetting:

```ts
// constants/user-profile-form-default-state.const.ts
export const USER_PROFILE_FORM_DEFAULT_STATE: UserProfileFormModel = {
  name: '',
  email: '',
  age: 0,
};
```

```ts
protected readonly profileModel = signal<UserProfileFormModel>(USER_PROFILE_FORM_DEFAULT_STATE);

protected readonly profileForm = form(this.profileModel, profileFormSchema);
```

- Initialize every field the template renders. `undefined` excludes a field from the field
  tree, so use `''` for text, `0` for numbers, and `[]` for arrays. Use `null` only when the
  field and its control explicitly support a nullable value; native text controls generally
  should use `''` for empty input.
- Fields are `FieldTree` nodes — call them as functions to read state:
  `profileForm.email().value()`, `profileForm.email().touched()`,
  `profileForm.email().errors()`. `profileForm.email.value()` (no call) is a mistake, not a
  shorthand — the uncalled node is the tree, not the state.
- Replace the whole form or load API data through the model signal (`profileModel.set(...)` or
  `.update(...)`). For a deliberate single-field edit, `profileForm.email().value.set(x)` or
  `.update(...)` is also supported and propagates back to the model. Never call `.set()` on
  the uncalled field-tree node (`profileForm.email.set(x)`).
- In the template, bind the control with `[formField]`, not `[value]`/`[checked]` +
  a change handler:

```html
<input [formField]="profileForm.name" />
@if (profileForm.name().touched() && profileForm.name().invalid()) { @for (error of
profileForm.name().errors(); track error.kind) {
<p>{{ error.message }}</p>
} }
```

Import `FormField` in every standalone component that binds fields. Use `FormRoot` for a
native `<form>` so Angular owns `novalidate`, prevents the browser's default navigation, and
starts the configured submission lifecycle:

```ts
import { FormField, FormRoot } from '@angular/forms/signals';

@Component({
  imports: [FormField, FormRoot],
  // ...
})
export class ProfileEditor {}
```

```html
<form [formRoot]="profileForm">
  <input [formField]="profileForm.name" />
  <button type="submit">Save</button>
</form>
```

Do not add a second `(submit)` handler or call `event.preventDefault()` when `FormRoot` is
used. If the form is not rooted in a native `<form>`, call `submit(profileForm, ...)`
explicitly.

- Don't set `[disabled]` or `[readonly]` as competing state sources on a `[formField]`-bound
  control — express them as schema rules (`disabled()` and `readonly()`) instead;
  `[formField]` syncs those states automatically. Put validation constraints in the schema
  (`min()`, `max()`, `required()`, `minLength()`, and `maxLength()`); Angular may mirror
  supported constraints to native attributes for input behavior and accessibility, but the
  field state is the source of truth.
- Exception: a static `value` on a radio/checkbox input is required to identify which
  option it represents — that's not a state attribute, keep it.

## Schema and Validators

Pass a schema function as `form()`'s second argument. Extract it to a named, exported
function — never an inline arrow — so it's reusable and independently testable:

```ts
// helpers/user-profile-form.schema.ts
export function profileFormSchema(path: SchemaPath<UserProfileFormModel>) {
  required(path.name, { message: 'Name is required' });
  required(path.email, { message: 'Email is required' });
  email(path.email, { message: 'Enter a valid email address' });
  min(path.age, 18, { message: 'Must be 18 or older' });
}
```

- Built-in validators: `required`, `email`, `min`, `max`, `minLength`, `maxLength`, and
  `pattern`. Built-in rules accept an options object for a custom `message` and conditional
  execution through a reactive `when` predicate. Use `applyWhen()` for a group of rules and
  `applyWhenValue()` when a type guard should narrow a union value.
- Custom validation: `validate(path, ({ value, valueOf, state }) => ...)`, returning
  `{ kind, message }` or `null`/`undefined`. Prefer one no-error value consistently within
  the project. Read other fields with `valueOf(otherPath)` for dependency-tracked
  cross-field checks, and use `stateOf(otherPath)` when the rule depends on interaction or
  validation state — never read a sibling field's raw signal outside the context object.
- Async validation (uniqueness checks, server-side rules): prefer `validateHttp()` for HTTP
  endpoints; use lower-level `validateAsync(path, { params, factory, onSuccess, onError })`
  for non-HTTP or custom resource logic. Synchronous rules run first, pending requests are
  cancelled when the value changes, and `onError` is required.

### Reusable Validators — Don't Duplicate Across Forms

Never re-type the same `required`/`pattern`/cross-field logic in every form that happens to
share a field shape. Two composition tools cover this:

**A standalone validator function**, when the rule itself (not the whole field) repeats:

```ts
// shared/utilities/validators/us-zip-code.validator.ts
export function usZipCode(path: FieldPath<string>) {
  pattern(path, /^\d{5}$/, { message: 'Enter a 5-digit ZIP code' });
}
```

```ts
export function shippingAddressSchema(path: SchemaPath<AddressFormModel>) {
  required(path.street);
  usZipCode(path.zip);
}
```

**A reusable partial schema + `apply()`**, when a whole sub-shape of fields (and its rules)
repeats across otherwise-different forms — define it against a narrow, structurally-typed
interface covering just the shared fields, then `apply()` it into each concrete form's
schema:

```ts
// contact-info.schema.ts
export interface ContactInfo {
  readonly email: string;
  readonly phone: string;
}

export function contactInfoSchema(path: SchemaPath<ContactInfo>) {
  required(path.email);
  email(path.email);
  pattern(path.phone, /^\+?\d{7,15}$/);
}
```

```ts
export function supplierFormSchema(path: SchemaPath<SupplierFormModel>) {
  required(path.companyName);
  apply(path, contactInfoSchema); // SupplierFormModel structurally satisfies ContactInfo
}
```

- `applyWhen(path, ({ valueOf }) => condition, subSchema)` — apply a set of rules only when
  a condition holds (e.g. extra fields required only when a checkbox is checked). Don't
  simulate this by hand-toggling `required`'s `when` option across multiple validators.
- `applyEach(itemPath, (item) => ...)` — apply one schema to every item of an array field
  (single-argument callback only — no index parameter).

## Reactive Field Logic

Use schema rules for field behavior that depends on other values or state:

```ts
export function orderFormSchema(path: SchemaPath<OrderFormModel>) {
  disabled(path.couponCode, {
    when: ({ valueOf }) => valueOf(path.total) < 50,
  });
  hidden(path.companyName, {
    when: ({ valueOf }) => valueOf(path.customerType) !== 'business',
  });
  readonly(path.orderNumber);
}
```

- `disabled()` and `readonly()` are synchronized to a `[formField]` control and skip that
  field's validation while active. Do not toggle them imperatively with `enable()` or
  `disable()`.
- `hidden()` is form state, not a DOM instruction. It also skips validation, but it does not
  remove the element; use `@if (!form.companyName().hidden())` or an intentional CSS rule.
- Use `valueOf()` for another field's value, `stateOf()` for its state, and `fieldTreeOf()`
  when a rule must target another field. These reads are dependency-tracked automatically;
  do not add subscriptions just to re-run cross-field validation.
- Use typed `metadata()` for field-adjacent information such as help-text IDs, analytics
  labels, or layout hints. Keep that information out of the submitted form model and avoid a
  parallel field-name-to-metadata map.

Do not rely on native `:valid`/`:invalid`, `validity`, or `validationMessage` to render form
state. Read `valid()`, `invalid()`, `pending()`, `touched()`, and `errors()` from the field
state instead. `FormRoot` uses `novalidate`; mirrored native constraints improve input
behavior and accessibility but are not the validation API.

Signal Forms does not add the Reactive Forms status classes (`ng-valid`, `ng-invalid`,
`ng-touched`, and similar) automatically. Prefer binding classes to field state where the
component owns the styling. If an existing global stylesheet depends on the classic names,
configure them explicitly at bootstrap with `provideSignalFormsConfig`; use the
`NG_STATUS_CLASSES` preset only for a compatibility migration.

```ts
import {provideSignalFormsConfig} from '@angular/forms/signals';
import {NG_STATUS_CLASSES} from '@angular/forms/signals/compat';

providers: [
  provideSignalFormsConfig({ classes: NG_STATUS_CLASSES }),
],
```

## Debouncing

Choose the narrowest debounce boundary:

- `debounce(path, 300)` delays the model update and everything downstream of it, including
  sync validation, derived state, and async validation.
- `validateHttp(path, { debounce: 300, ... })` or `validateAsync(path, { debounce: 300, ... })`
  keeps the model and cheap synchronous rules immediate while delaying only the expensive
  validator. Prefer this for username/email availability checks.

Use `debounce(path, 'blur')` when the entire field should commit only after focus leaves it.
Touching a field flushes a pending debounce, and form submission touches interactive fields
before validation, so a user cannot lose the latest typed value merely because the timer has
not expired.

## Domain Model vs Form Model

When the data a form edits comes from an API and has optional/nullable fields, keep two
interfaces: a `*DomainModel` matching the backend and a `*FormModel` shaped for the controls.
Give every rendered form field an explicit initial value; use `null` only when the field and
control intentionally support it. Convert at the boundary with a plain mapping function:

```ts
protected readonly formModel = signal<UserProfileFormModel>(toFormModel(this.domainModel()));
protected readonly editForm = form(this.formModel, editFormSchema);
```

Update the form model explicitly when loading a new record, and map it back to the domain or
API DTO at the save boundary. Avoid a live `linkedSignal()` when incoming domain updates could
overwrite edits already made in the form.

## Submission

```ts
protected readonly profileForm = form(
  this.profileModel,
  profileFormSchema,
  {
    submission: {
      action: async (field) => {
        const result = await firstValueFrom(this.profileApi.save(field().value()));
        if (result.kind === 'error') {
          return result.errors.map((error) => ({
            kind: 'server',
            message: error.message,
            fieldTree: field[error.field as keyof typeof field],
          }));
        }
        return undefined;
      },
      ignoreValidators: 'none',
      onInvalid: (field) => {
        field().errorSummary()[0]?.fieldTree().focusBoundControl();
      },
    },
  },
);
```

- Bind this form with `<form [formRoot]="profileForm">` and a real
  `<button type="submit">`. `FormRoot` prevents the browser navigation, marks interactive
  fields touched, and starts the configured submission lifecycle. Do not add a parallel
  `(submit)` handler or `preventDefault()` call.
- The `action` must be async (or return a `Promise`). Return server errors from it, targeted
  with `fieldTree`, instead of maintaining a separate error signal. Submission errors are
  shown with `errors()` and clear when the user edits the affected field.
- `ignoreValidators: 'pending'` is the default: pending async validators do not block the
  action. Use `'none'` when all async checks must settle before a consequential submit; use
  `'all'` only for draft-saving flows that intentionally persist invalid data.
- Use `profileForm().submitting()` to disable the submit button and prevent duplicate work:
  `[disabled]="profileForm().submitting()"`. Add `pending()` to the UI only when you want to
  communicate an in-flight field validation; do not assume it gates submission.
- `onInvalid` runs after fields are touched. Focus the first error with
  `errorSummary()[0]?.fieldTree().focusBoundControl()`; a custom control should implement
  `focus()` if it wraps more than one native element.
- For a button outside the form or a wizard step, call `submit(profileForm, options)` directly
  and use its returned `Promise<boolean>` for navigation or notifications.

Reset interaction state with `profileForm().reset()`. Pass a new model value when the reset
must also replace the data, for example `profileForm().reset(USER_PROFILE_FORM_DEFAULT_STATE)`.
Without an argument, `reset()` clears state such as `touched` and `dirty` but keeps the current
value.

## Custom Controls

Use `FormValueControl<T>` for a custom control that edits one value and expose a `value` model
signal. Use `FormCheckboxControl` for a checkbox-like control and expose `checked` instead.
The control must not expose both properties. Keep validation in the form schema; a custom
control only renders the state that `[formField]` provides.

```ts
import { input, model, output } from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

export class TagInput implements FormValueControl<readonly string[]> {
  readonly value = model<readonly string[]>([]);
  readonly disabled = input(false);
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  readonly touched = input(false);
  readonly touch = output<void>();
}
```

Declare only the optional state inputs the control uses (`disabled`, `readonly`, `hidden`,
`touched`, `dirty`, `invalid`, `pending`, `errors`, `name`, and validation constraints).
Emit `touch` from the control's `blur` path, not its `focus` path, so touched state and
`debounce('blur')` work consistently. Implement `focus()` when the control should support
`focusBoundControl()`.

Use `transformedValue()` when the UI edits a raw representation but the model stores another
type, such as a formatted currency string backed by a number. Return a parse error rather than
writing an invalid value to the model; parse errors appear in `errors()` and block submission.
Do not implement both `ControlValueAccessor` and `FormValueControl`/`FormCheckboxControl` on
the same component.

## Reactive Forms Interop

For an existing Reactive Forms codebase, migrate at a boundary or one control at a time:

- `compatForm(model)` can include an existing `FormControl` or `FormGroup` in a Signal Form.
  Keep that control's validators on the Reactive Forms side; do not attach Signal Forms rules
  directly to a `FormControl` field.
- `SignalFormControl` can place a Signal Forms control inside an existing `FormGroup` or
  `FormArray`. Bind it with `[formField]="emailControl.fieldTree"`, not `formControlName` or
  `[formControl]`.
- Before converting a control, find imperative callers. `enable()`, `disable()`,
  `setValidators()`, and `setErrors()` are not supported on a `SignalFormControl`; express
  availability and validity as declarative Signal Forms rules instead.
- Custom controls implementing `FormValueControl` or `FormCheckboxControl` can be reused by
  Signal, Reactive, and template-driven forms. Do not add a second adapter unless a real API
  incompatibility requires it.

## Review Checklist

- [ ] No manual `(change)`/`(input)` handler casting `event.target` where `[formField]` or
      `[(ngModel)]` belongs instead.
- [ ] Multi-field/validated/submittable input uses Signal Forms; `[(ngModel)]` is reserved
      for genuinely standalone controls with no group, validation, or submit step.
- [ ] Reactive Forms are limited to an existing or deliberately unsupported boundary; new
      forms do not introduce `FormGroup`/`FormControl` when Signal Forms covers the need.
- [ ] A standalone toggle's state stays a signal — bound via expanded `[ngModel]` +
      `(ngModelChange)="sig.set($event)"`, never the `[(ngModel)]="sig"` banana-in-box
      sugar (it reassigns the property directly and doesn't call `.set()`) and never
      demoted to a plain mutable field just to dodge that limitation.
- [ ] Form model is a named interface (never inline), placed per
      `../architecture/folder-structure.md`; every rendered field is initialized, and
      `undefined` is not used because it excludes the field from the tree.
- [ ] Field state is read by calling the node (`field().value()`), never the uncalled tree
      (`field.value()`); whole-form updates use the model signal, while deliberate single
      field updates use `field().value.set()`/`.update()`.
- [ ] Schema is a named, exported function, not an inline arrow passed to `form()`.
- [ ] `[disabled]`/`[readonly]` state and validation constraints are defined in the schema,
      not as competing sources on a `[formField]`-bound control (radio/checkbox static
      `value` excepted).
- [ ] Repeated validation rule extracted to a standalone validator function; repeated
      sub-shape of fields extracted to a reusable schema applied via `apply()`/
      `applyWhen()`/`applyEach()` — no copy-pasted validator logic across forms.
- [ ] Cross-field rules use `valueOf()`/`stateOf()` so dependencies are tracked automatically;
      no manual subscriptions for revalidation.
- [ ] Per-field help, analytics, or layout metadata uses typed `metadata()` rather than
      polluting the submitted model or adding a parallel lookup map.
- [ ] `validateHttp()`/`validateAsync()` has an `onError` handler, and async checks are
      preceded by cheap synchronous validation.
- [ ] Debounce scope is intentional: `debounce()` for the whole field, validator-level
      `debounce` for only an expensive async check.
- [ ] `FormRoot` owns native form submission, or an explicit `submit()` call is used — not a
      second hand-rolled submit handler.
- [ ] `submit()` action is async; server errors are returned with `fieldTree`; consequential
      forms set `ignoreValidators: 'none'` when async validators must settle.
- [ ] Submit UI uses `form().submitting()` to prevent duplicate work; `pending()` is not
      assumed to gate submission.
- [ ] Invalid submission focuses the first error via `errorSummary()` and
      `focusBoundControl()`; custom controls implement `focus()` when needed.
- [ ] Custom scalar controls use `FormValueControl` with `value`; checkbox-like controls use
      `FormCheckboxControl` with `checked`; neither implements both contracts or also CVA.
- [ ] `compatForm`/`SignalFormControl` interop uses the documented boundary bindings and no
      unsupported imperative setters on `SignalFormControl`.
