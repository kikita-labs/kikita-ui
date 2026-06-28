# Dialog

Modal overlay opened imperatively via `kuiDialog()`. Built on Angular CDK Overlay.

## Usage

```ts
// 1. Define the dialog component
@Component({ ... })
export class EditUserDialog implements KuiDialogHost<'saved' | null, UserData> {
  public readonly dialogContext =
    inject<KuiDialogContext<'saved' | null, UserData>>(KUI_DIALOG_CONTEXT);
}

// 2. Create a typed opener (in injection context)
export function injectEditUserDialog() {
  return kuiDialog(EditUserDialog, { size: 'md' });
}

// 3. Use in a component
class MyPage {
  private openEditUser = injectEditUserDialog();

  edit(user: User) {
    this.openEditUser({ userId: user.id })
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        if (result === 'saved') this.reload();
      });
  }
}
```

## Dialog component contract

```ts
@Component({ ... })
export class MyDialog implements KuiDialogHost<TResult, TData> {
  // Must be `public`, must be named `dialogContext`
  public readonly dialogContext =
    inject<KuiDialogContext<TResult, TData>>(KUI_DIALOG_CONTEXT);
}
```

`dialogContext` provides:

| Member       | Type                         | Description                               |
| ------------ | ---------------------------- | ----------------------------------------- |
| `data`       | `TData`                      | Data passed via `kuiDialog()(data)`       |
| `closable`   | `boolean`                    | Whether to show the × button              |
| `appearance` | `KuiDialogAppearance`        | Visual intent (colors `.kui-dialog-icon`) |
| `close(r?)`  | `(result?: TResult) => void` | Close the dialog, optionally with result  |

## KuiDialogConfig

| Option        | Type                  | Default     | Description                                   |
| ------------- | --------------------- | ----------- | --------------------------------------------- |
| `data`        | `TData`               | —           | Passed into the component via `dialogContext` |
| `size`        | `KuiDialogSize`       | `'md'`      | Panel width preset                            |
| `appearance`  | `KuiDialogAppearance` | `'default'` | Colors `.kui-dialog-icon` via CSS variable    |
| `dismissable` | `boolean`             | `true`      | Allow Escape / backdrop-click to close        |
| `closable`    | `boolean`             | `true`      | Expose × button flag via `dialogContext`      |

## KuiDialogSize

| Value  | Width                      |
| ------ | -------------------------- |
| `auto` | `auto`, `min-width: 320px` |
| `sm`   | 400 px                     |
| `md`   | 560 px                     |
| `lg`   | 720 px                     |

## KuiDialogAppearance

| Value     | Icon color                      |
| --------- | ------------------------------- |
| `default` | `currentColor` (no override)    |
| `danger`  | `var(--kui-color-danger-fill)`  |
| `warning` | `var(--kui-color-warning-fill)` |

## CSS structure

```html
<div class="kui-dialog-backdrop">
  <div class="kui-dialog kui-dialog--md" role="dialog" aria-modal="true">
    <div class="kui-dialog-header">
      <!-- optional icon slot — add class="kui-dialog-icon" to your SVG -->
      <svg class="kui-dialog-icon" ...></svg>
      <h2 class="kui-dialog-title">Title</h2>
      <button class="kui-dialog-close" aria-label="Close">×</button>
    </div>
    <div class="kui-dialog-body">…</div>
    <div class="kui-dialog-footer">…</div>
  </div>
</div>
```

### `.kui-dialog-icon`

Place any SVG or icon before `.kui-dialog-title` inside `.kui-dialog-header`.
Its `color` is controlled by `--kui-dialog-icon-color`, which is set automatically
based on `appearance`. Size is fixed at 20 × 20 px.

## CSS tokens

| Token                     | Default                             |
| ------------------------- | ----------------------------------- |
| `--kui-dialog-bg`         | `var(--kui-color-surface-elevated)` |
| `--kui-dialog-border`     | `var(--kui-color-border)`           |
| `--kui-dialog-radius`     | `var(--kui-radius-lg)`              |
| `--kui-dialog-shadow`     | `var(--kui-shadow-lg)`              |
| `--kui-dialog-backdrop`   | `oklch(0 0 0 / 0.5)`                |
| `--kui-dialog-padding-x`  | `var(--kui-space-6)` (24 px)        |
| `--kui-dialog-padding-y`  | `var(--kui-space-4)` (16 px)        |
| `--kui-dialog-title-size` | `var(--kui-text-lg-size)`           |
| `--kui-dialog-icon-color` | set by `data-kui-appearance` attr   |

## Animations

- Open: `kui-dialog-in` (200 ms) + `kui-bd-in` (200 ms) — scale 0.95→1 + opacity
- Close: `kui-dialog-out` (150 ms) + `kui-bd-out` (150 ms)
- `prefers-reduced-motion`: opacity only, no scale

## Accessibility

- `role="dialog"` and `aria-modal="true"` on the panel
- Focus is trapped inside the dialog via CDK `cdkTrapFocus`
- Escape closes when `dismissable: true`
- Page scroll is blocked via CDK block scroll strategy while open

## Confirm

Pre-built confirmation dialog. No custom component required.

```ts
class MyPage {
  private readonly confirm = kuiConfirm();

  delete(id: string) {
    this.confirm({
      title: 'Delete record?',
      message: 'This action cannot be undone.',
      appearance: 'danger',
      confirmLabel: 'Delete',
    })
      .pipe(takeUntilDestroyed())
      .subscribe((ok) => {
        if (ok) this.deleteItem(id);
      });
  }
}
```

`kuiConfirm()` always sets `dismissable: false` and `closable: false` — the user must choose.
Returns `Observable<boolean>`: `true` = confirmed, `false` = cancelled.

### KuiConfirmConfig

| Option         | Type                  | Default     | Description                      |
| -------------- | --------------------- | ----------- | -------------------------------- |
| `title`        | `string`              | required    | Header text                      |
| `message`      | `string`              | —           | Body text (omit for header-only) |
| `appearance`   | `KuiDialogAppearance` | `'default'` | Icon color + confirm button      |
| `confirmLabel` | `string`              | `'OK'`      | Confirm button label             |
| `cancelLabel`  | `string`              | `'Cancel'`  | Cancel button label              |

## Public API

| Symbol                | Description                                   |
| --------------------- | --------------------------------------------- |
| `kuiDialog()`         | Inject-function factory — primary entry point |
| `kuiConfirm()`        | Pre-built confirmation dialog                 |
| `KuiDialogHost`       | Interface for dialog components               |
| `KuiDialogContext`    | Data + close callback injected into dialog    |
| `KUI_DIALOG_CONTEXT`  | Injection token for `KuiDialogContext`        |
| `KuiDialogConfig`     | Options passed to `kuiDialog()`               |
| `KuiDialogSize`       | Width preset union type                       |
| `KuiDialogAppearance` | Visual intent union type                      |
| `KuiConfirmConfig`    | Options passed to `kuiConfirm()(config)`      |
| `KuiDialogRef`        | Observable handle (advanced use)              |
