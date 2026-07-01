# Drawer

`kuiDrawer()` opens a typed modal edge panel in a CDK overlay.

Use Drawer for secondary workflows that keep page context visible: filters, detail panels, edit forms, navigation panels, and mobile action sheets.

## Import

```ts
import {
  KUI_DRAWER_CONTEXT,
  KuiButtonDirective,
  KuiDrawerContext,
  KuiDrawerHost,
  kuiDrawer,
} from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Basic Usage

```ts
interface EditData {
  id: string;
}

type EditResult = 'saved' | 'cancelled';

@Component({
  selector: 'app-edit-drawer',
  template: `
    <div class="kui-drawer-header">
      <div class="kui-drawer-header-text">
        <h2 class="kui-drawer-title">Edit item</h2>
        <div class="kui-drawer-subtitle">{{ drawerContext.data.id }}</div>
      </div>
      <button
        class="kui-drawer-close"
        type="button"
        aria-label="Close"
        (click)="drawerContext.close('cancelled')"
      >
        ...
      </button>
    </div>
    <div class="kui-drawer-body">...</div>
    <div class="kui-drawer-footer">
      <button
        kuiButton
        appearance="outline"
        type="button"
        (click)="drawerContext.close('cancelled')"
      >
        Cancel
      </button>
      <button kuiButton type="button" (click)="drawerContext.close('saved')">Save</button>
    </div>
  `,
  imports: [KuiButtonDirective],
})
export class EditDrawer implements KuiDrawerHost<EditResult, EditData> {
  public readonly drawerContext =
    inject<KuiDrawerContext<EditResult, EditData>>(KUI_DRAWER_CONTEXT);
}

function injectEditDrawer() {
  return kuiDrawer(EditDrawer, { side: 'right', size: 'md' });
}
```

## Config

| Option                 | Type                                     | Default   | Notes                                                     |
| ---------------------- | ---------------------------------------- | --------- | --------------------------------------------------------- |
| `side`                 | `'right' \| 'left' \| 'bottom' \| 'top'` | `'right'` | Edge from which the drawer enters.                        |
| `size`                 | `'sm' \| 'md' \| 'lg' \| 'full'`         | `'md'`    | Width for left/right, height for top/bottom.              |
| `closeOnBackdropClick` | `boolean`                                | `true`    | Disable for required actions.                             |
| `closeOnEscape`        | `boolean`                                | `true`    | Disable for required actions.                             |
| `closable`             | `boolean`                                | `true`    | Passed to the content context for close-button rendering. |

## Accessibility

- Drawer renders `role="dialog"` and `aria-modal="true"`.
- Focus is trapped inside the drawer while open.
- Focus returns to the previously focused element after close.
- If `.kui-drawer-title` exists, it is wired as `aria-labelledby`.
- Escape closes by default unless `closeOnEscape` is `false`.
- Backdrop click closes by default unless `closeOnBackdropClick` is `false`.

## Tokens

Drawer styles consume public Kikita CSS variables:

- `--kui-drawer-bg`
- `--kui-drawer-border`
- `--kui-drawer-radius`
- `--kui-drawer-backdrop-bg`
- `--kui-drawer-width-sm`
- `--kui-drawer-width-md`
- `--kui-drawer-width-lg`
- `--kui-drawer-height-sm`
- `--kui-drawer-height-md`
- `--kui-drawer-height-lg`
- `--kui-drawer-duration-open`
- `--kui-drawer-duration-close`

See `projects/ui/src/styles/drawer.css` for the full token list.
