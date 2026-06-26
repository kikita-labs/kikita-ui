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

| Member      | Type                    | Description                                |
| ----------- | ----------------------- | ------------------------------------------ |
| `data`      | `TData`                 | Data passed via `kuiDialog()(data)`        |
| `closable`  | `boolean`               | Whether to show the × button               |
| `close(r?)` | `(result?: TResult) => void` | Close the dialog, optionally with result |

## KuiDialogConfig

| Option        | Type            | Default | Description                                   |
| ------------- | --------------- | ------- | --------------------------------------------- |
| `data`        | `TData`         | —       | Passed into the component via `dialogContext` |
| `size`        | `KuiDialogSize` | `'md'`  | Panel width preset                            |
| `dismissable` | `boolean`       | `true`  | Allow Escape / backdrop-click to close        |
| `closable`    | `boolean`       | `true`  | Expose × button flag via `dialogContext`      |

## KuiDialogSize

| Value  | Width  |
| ------ | ------ |
| `auto` | `auto`, `min-width: 320px` |
| `sm`   | 400 px |
| `md`   | 560 px |
| `lg`   | 720 px |

## CSS structure

```html
<div class="kui-dialog-backdrop">
  <div class="kui-dialog kui-dialog--md" role="dialog" aria-modal="true">
    <div class="kui-dialog-header">
      <h2 class="kui-dialog-title">Title</h2>
      <button class="kui-dialog-close" aria-label="Close">×</button>
    </div>
    <div class="kui-dialog-body">…</div>
    <div class="kui-dialog-footer">…</div>
  </div>
</div>
```

## CSS tokens

| Token                   | Default                                |
| ----------------------- | -------------------------------------- |
| `--kui-dialog-bg`       | `var(--kui-color-surface-elevated)`    |
| `--kui-dialog-border`   | `var(--kui-color-border)`              |
| `--kui-dialog-radius`   | `var(--kui-radius-lg)`                 |
| `--kui-dialog-shadow`   | `var(--kui-shadow-lg)`                 |
| `--kui-dialog-backdrop` | `oklch(0 0 0 / 0.5)`                   |
| `--kui-dialog-padding-x`| `var(--kui-space-6)` (24 px)           |
| `--kui-dialog-padding-y`| `var(--kui-space-4)` (16 px)           |
| `--kui-dialog-title-size` | `var(--kui-text-lg-size)`            |

## Animations

- Open: `kui-dialog-in` (200 ms) + `kui-bd-in` (200 ms) — scale 0.95→1 + opacity
- Close: `kui-dialog-out` (150 ms) + `kui-bd-out` (150 ms)
- `prefers-reduced-motion`: opacity only, no scale

## Accessibility

- `role="dialog"` and `aria-modal="true"` on the panel
- Focus is trapped inside the dialog via CDK `cdkTrapFocus`
- Escape closes when `dismissable: true`
- Page scroll is blocked via CDK block scroll strategy while open

## Public API

| Symbol           | Description                                  |
| ---------------- | -------------------------------------------- |
| `kuiDialog()`    | Inject-function factory — primary entry point |
| `KuiDialogHost`  | Interface for dialog components              |
| `KuiDialogContext` | Data + close callback injected into dialog |
| `KUI_DIALOG_CONTEXT` | Injection token for `KuiDialogContext`  |
| `KuiDialogConfig` | Options passed to `kuiDialog()`             |
| `KuiDialogSize`  | Width preset union type                      |
| `KuiDialogRef`   | Observable handle (advanced use)             |
