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

| Option                 | Type                                       | Default   | Notes                                                                                                    |
| ---------------------- | ------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------- |
| `side`                 | `'right' \| 'left' \| 'bottom' \| 'top'`   | `'right'` | Edge from which the drawer enters.                                                                       |
| `size`                 | `'sm' \| 'md' \| 'lg' \| 'full' \| 'auto'` | `'md'`    | Width for left/right, height for top/bottom. `'auto'` sizes to content (min 320px width / 200px height). |
| `closeOnBackdropClick` | `boolean`                                  | `true`    | Disable for required actions.                                                                            |
| `closeOnEscape`        | `boolean`                                  | `true`    | Disable for required actions.                                                                            |
| `closable`             | `boolean`                                  | `true`    | Render the close button, top-right of the panel.                                                         |

## CSS Structure

The drawer container renders the backdrop, panel, and — when `closable: true` — the
`.kui-drawer-close` button itself, absolutely positioned top-right of the panel. Your drawer
component only needs to supply the header/body/footer content:

```html
<div class="kui-drawer" data-kui-side="right" role="dialog" aria-modal="true">
  <!-- Your component's content, projected here: -->
  <div class="kui-drawer-header">
    <div class="kui-drawer-header-text">
      <h2 class="kui-drawer-title">Title</h2>
      <div class="kui-drawer-subtitle">Subtitle</div>
    </div>
  </div>
  <div class="kui-drawer-body">Content</div>
  <div class="kui-drawer-footer">Actions</div>
  <!-- Rendered automatically by the container, not by your template: -->
  <button class="kui-drawer-close" aria-label="Close">
    <kui-icon name="x" />
  </button>
</div>
```

The header reserves space on its trailing edge (via `.kui-drawer:has(> .kui-drawer-close)

> .kui-drawer-header`) so a long, wrapping title never runs underneath the button.

If your drawer component's own markup already includes a `.kui-drawer-close` element (older
manual markup), the container detects it and skips rendering its own button rather than showing
two. New drawer components should not render `.kui-drawer-close` themselves — let the container
handle it via `closable`.

## Accessibility

- Drawer renders `role="dialog"` and `aria-modal="true"`.
- Focus is trapped inside the drawer while open.
- Focus returns to the previously focused element after close.
- If `.kui-drawer-title` exists, it is wired as `aria-labelledby`.
- Escape closes by default unless `closeOnEscape` is `false`.
- Backdrop click closes by default unless `closeOnBackdropClick` is `false`, and only when
  the pointer interaction starts on the backdrop. Selecting text or dragging from inside the
  drawer cannot dismiss it.

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
- `--kui-drawer-close-offset-x` (default `var(--kui-drawer-header-padding-x)`)
- `--kui-drawer-close-offset-y` (default `var(--kui-drawer-header-padding-y)`)

See `projects/ui/src/styles/drawer.css` for the full token list.
