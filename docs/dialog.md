# Dialog

Modal overlay opened imperatively via `kuiDialog()`. Built on Angular CDK Overlay.

## Import

```ts
import {
  KUI_DIALOG_CONTEXT,
  KuiButtonDirective,
  KuiDialogContext,
  KuiDialogHost,
  kuiDialog,
} from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Usage

```ts
// 1. Define the dialog component
@Component({ ... })
export class EditUserDialog implements KuiDialogHost<'saved' | null, UserData> {
  public readonly dialogContext =
    inject<KuiDialogContext<'saved' | null, UserData>>(KUI_DIALOG_CONTEXT);
}

// 2. Create a typed opener in an injection context
export function injectEditUserDialog() {
  return kuiDialog(EditUserDialog, { size: 'md' });
}

// 3. Use in a component
class MyPage {
  private readonly openEditUser = injectEditUserDialog();

  edit(user: User) {
    this.openEditUser({ userId: user.id })
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        if (result === 'saved') this.reload();
      });
  }
}
```

## Dialog Component Contract

```ts
@Component({ ... })
export class MyDialog implements KuiDialogHost<TResult, TData> {
  public readonly dialogContext =
    inject<KuiDialogContext<TResult, TData>>(KUI_DIALOG_CONTEXT);
}
```

`dialogContext` provides:

| Member       | Type                         | Description                                                                                                                                                                                 |
| ------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`       | `TData`                      | Data passed via `kuiDialog()(data)`.                                                                                                                                                        |
| `closable`   | `boolean`                    | Mirrors {@link KuiDialogConfig.closable}. The close button itself is rendered automatically by the container — this is exposed for informational use only (e.g. adjusting your own layout). |
| `appearance` | `KuiDialogAppearance`        | Visual intent for `.kui-dialog-icon`.                                                                                                                                                       |
| `close(r?)`  | `(result?: TResult) => void` | Close the dialog, optionally with result.                                                                                                                                                   |

## KuiDialogConfig

| Option        | Type                  | Default     | Description                                      |
| ------------- | --------------------- | ----------- | ------------------------------------------------ |
| `data`        | `TData`               | `undefined` | Passed into the component via `dialogContext`.   |
| `size`        | `KuiDialogSize`       | `'md'`      | Panel width preset.                              |
| `appearance`  | `KuiDialogAppearance` | `'default'` | Colors `.kui-dialog-icon` via CSS variable.      |
| `dismissable` | `boolean`             | `true`      | Allow Escape and backdrop-click to close.        |
| `closable`    | `boolean`             | `true`      | Render the close button, top-right of the panel. |

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
| `default` | `currentColor`                  |
| `danger`  | `var(--kui-color-danger-fill)`  |
| `warning` | `var(--kui-color-warning-fill)` |

## CSS Structure

The dialog container renders the backdrop, panel, and — when `closable: true` — the
`.kui-dialog-close` button itself, absolutely positioned top-right of the panel. Your dialog
component only needs to supply the header/body/footer content:

```html
<div class="kui-dialog-backdrop">
  <div class="kui-dialog kui-dialog--md" role="dialog" aria-modal="true">
    <!-- Your component's content, projected here: -->
    <div class="kui-dialog-header">
      <!-- Optional icon slot: add class="kui-dialog-icon" to your SVG. -->
      <svg class="kui-dialog-icon" aria-hidden="true"></svg>
      <h2 class="kui-dialog-title">Title</h2>
    </div>
    <div class="kui-dialog-body">Content</div>
    <div class="kui-dialog-footer">Actions</div>
    <!-- Rendered automatically by the container, not by your template: -->
    <button class="kui-dialog-close" aria-label="Close">
      <kui-icon name="x" />
    </button>
  </div>
</div>
```

The header reserves space on its right edge (via `.kui-dialog:has(> .kui-dialog-close)

> .kui-dialog-header`) so a long, wrapping title never runs underneath the button.

If your dialog component's own markup already includes a `.kui-dialog-close` element (older
manual markup), the container detects it and skips rendering its own button rather than showing
two. New dialog components should not render `.kui-dialog-close` themselves — let the container
handle it via `closable`.

### `.kui-dialog-icon`

Place an SVG or icon before `.kui-dialog-title` inside `.kui-dialog-header`.
Its `color` is controlled by `--kui-dialog-icon-color`, which is set
automatically from `appearance`. Size is fixed at 20 x 20 px.

## CSS Tokens

| Token                         | Default                             |
| ----------------------------- | ----------------------------------- |
| `--kui-dialog-bg`             | `var(--kui-color-surface-elevated)` |
| `--kui-dialog-border`         | `var(--kui-color-border)`           |
| `--kui-dialog-radius`         | `var(--kui-radius-lg)`              |
| `--kui-dialog-shadow`         | `var(--kui-shadow-lg)`              |
| `--kui-dialog-backdrop`       | `oklch(0 0 0 / 0.5)`                |
| `--kui-dialog-padding-x`      | `var(--kui-space-6)`                |
| `--kui-dialog-padding-y`      | `var(--kui-space-4)`                |
| `--kui-dialog-title-size`     | `var(--kui-text-lg-size)`           |
| `--kui-dialog-icon-color`     | set by `data-kui-appearance` attr   |
| `--kui-dialog-close-offset-x` | `var(--kui-dialog-padding-x)`       |
| `--kui-dialog-close-offset-y` | `var(--kui-dialog-padding-y)`       |

## Animations

- Open: `kui-dialog-in` (200 ms) and `kui-bd-in` (200 ms), scale 0.95 to 1 plus opacity.
- Close: `kui-dialog-out` (150 ms) and `kui-bd-out` (150 ms).
- `prefers-reduced-motion`: opacity only, no scale.

## Accessibility

- `role="dialog"` and `aria-modal="true"` are set on the panel.
- The panel uses `aria-labelledby` when `.kui-dialog-title` exists.
- The panel falls back to `aria-label="Dialog"` when no title is present.
- Focus is trapped inside the dialog via CDK `cdkTrapFocus`.
- Focus returns to the opener after the dialog closes.
- Escape closes when `dismissable: true`.
- Backdrop dismissal only applies when the pointer interaction starts on the backdrop;
  selecting text or dragging from inside the panel cannot dismiss the dialog.
- Page scroll is blocked via CDK block scroll strategy while open.

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

`kuiConfirm()` always sets `dismissable: false` and `closable: false`; the user
must choose. It returns `Observable<boolean>` where `true` means confirmed and
`false` means cancelled.

### KuiConfirmConfig

| Option         | Type                  | Default     | Description                 |
| -------------- | --------------------- | ----------- | --------------------------- |
| `title`        | `string`              | required    | Header text.                |
| `message`      | `string`              | `undefined` | Body text.                  |
| `appearance`   | `KuiDialogAppearance` | `'default'` | Icon color and button tone. |
| `confirmLabel` | `string`              | `'OK'`      | Confirm button label.       |
| `cancelLabel`  | `string`              | `'Cancel'`  | Cancel button label.        |

## Public API

| Symbol                | Description                             |
| --------------------- | --------------------------------------- |
| `kuiDialog()`         | Inject-function factory primary entry.  |
| `kuiConfirm()`        | Pre-built confirmation dialog.          |
| `KuiDialogHost`       | Interface for dialog components.        |
| `KuiDialogContext`    | Data and close callback.                |
| `KUI_DIALOG_CONTEXT`  | Injection token for `KuiDialogContext`. |
| `KuiDialogConfig`     | Options passed to `kuiDialog()`.        |
| `KuiDialogSize`       | Width preset union type.                |
| `KuiDialogAppearance` | Visual intent union type.               |
| `KuiConfirmConfig`    | Options passed to `kuiConfirm()`.       |
| `KuiDialogRef`        | Observable handle for advanced use.     |
