# Toast

Non-blocking notifications displayed over the interface. Imperatively opened via `kuiToast()`. Auto-dismiss with optional hover-pause and progress bar.

## Import

```ts
import { kuiToast, provideKikitaUi } from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Usage

```ts
@Component({ ... })
export class MyComponent {
  private toast = kuiToast();

  save() {
    this.api.save().subscribe({
      next: () =>
        this.toast.open({ title: 'Saved', appearance: 'success' }),
      error: () =>
        this.toast.open({ title: 'Failed', appearance: 'danger', persistent: true }),
    });
  }
}
```

## Persistent and reactive lifecycle

`persistent: true` disables auto-dismiss while keeping the toast manually closable through its
close button or returned reference. `persistent` also accepts a `Signal<boolean>`; changing the
signal to `false` starts the configured timer, while changing it to `true` pauses the timer and
preserves its remaining time.

Lifecycle rules:

- A signal only needs to be readable; the toast never writes to it. A `computed` works.
- Turning the signal `true` freezes the time left; turning it `false` resumes that time. A toast
  opened with a `true` signal starts the full duration the first time the signal becomes `false`.
- `ref.update({ persistent })` or `ref.update({ duration })` restarts the full duration. An update
  that omits `persistent` keeps the current binding; one that sets it replaces the previous value or
  signal, and the old signal is detached.
- An explicit `persistent` value, even `false`, wins over `duration: Infinity`; a non-finite or
  missing duration then uses the default duration. `ref.update({ duration: undefined })` also uses
  the default duration the toast was opened with.
- Hovering the toast pauses the timer; leaving resumes it unless the toast is persistent.
- Updates after the toast starts closing are ignored. Closing the toast or destroying the region
  detaches every signal subscription and timer, and completes `closed$` and `action$`.
- The server renders no toast and starts no timer.

```ts
import { signal } from '@angular/core';

const persistent = signal(true);
const ref = this.toast.open({
  title: 'Uploading…',
  message: 'This toast is controlled by a signal.',
  appearance: 'info',
  persistent,
});

// Start auto-dismiss using the configured duration.
persistent.set(false);

// Or close immediately at any time.
ref.close();
```

## With action button

```ts
const ref = this.toast.open({
  title: 'Message deleted',
  actionLabel: 'Undo',
  duration: 6000,
});

ref.action$.pipe(takeUntilDestroyed()).subscribe(() => this.undoDelete());
```

## Global defaults

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideKikitaUi({
      defaults: { toast: { position: 'top-end', duration: 4000, maxVisible: 5 } },
    }),
  ],
};
```

## KuiToastConfig

| Property       | Type                         | Default     | Description                                                   |
| -------------- | ---------------------------- | ----------- | ------------------------------------------------------------- |
| `title`        | `string`                     | -           | **Required.** Headline text.                                  |
| `message`      | `string`                     | -           | Supporting text below the title.                              |
| `appearance`   | `KuiToastAppearance`         | `'neutral'` | Visual intent, controls accent bar and icon colour.           |
| `actionLabel`  | `string`                     | -           | Label for inline action button. Clicking emits `ref.action$`. |
| `duration`     | `number`                     | `5000`      | Auto-dismiss delay in ms; `Infinity` keeps the toast open.    |
| `persistent`   | `boolean \| Signal<boolean>` | `false`     | Keep the toast open; a signal can control this reactively.    |
| `closable`     | `boolean`                    | `true`      | Show the close button.                                        |
| `showIcon`     | `boolean`                    | `true`      | Show the appearance icon (neutral has no icon).               |
| `showProgress` | `boolean`                    | `false`     | Show a progress bar tracking time until auto-dismiss.         |

## KuiToastRef

```ts
interface KuiToastRef {
  readonly id: number;
  close(): void;
  update(config: Partial<KuiToastConfig>): void;
  readonly closed$: Observable<void>;
  readonly action$: Observable<void>;
}
```

`ref.update()` changes the toast in place and re-evaluates its timer. This is useful for async
flows such as loading → success or loading → error:

```ts
const ref = this.toast.open({ title: 'Uploading…', persistent: true });

this.api.upload().subscribe({
  next: () =>
    ref.update({
      title: 'Uploaded',
      appearance: 'success',
      persistent: false,
      duration: 3000,
      showProgress: true,
    }),
  error: () => ref.update({ title: 'Upload failed', appearance: 'danger', persistent: true }),
});
```

For cross-feature cleanup, the service can dismiss one toast by its reference id or dismiss all
toasts created by that service:

```ts
this.toast.dismiss(ref.id);
this.toast.dismissAll();
```

## KuiToastOptions (global)

| Property       | Type               | Default           | Description                                     |
| -------------- | ------------------ | ----------------- | ----------------------------------------------- |
| `position`     | `KuiToastPosition` | `'bottom-center'` | Position of the toast region.                   |
| `duration`     | `number`           | `5000`            | Default auto-dismiss delay.                     |
| `maxVisible`   | `number`           | `3`               | Max simultaneous toasts. 4th evicts the oldest. |
| `showProgress` | `boolean`          | `false`           | Default for `showProgress`.                     |
| `closable`     | `boolean`          | `true`            | Default for `closable`.                         |
| `showIcon`     | `boolean`          | `true`            | Default for `showIcon`.                         |

## Appearances

| Value     | Accent / Icon colour                  |
| --------- | ------------------------------------- |
| `neutral` | `--kui-color-border-strong` (no icon) |
| `success` | `--kui-color-success-fill`            |
| `warning` | `--kui-color-warning-fill`            |
| `danger`  | `--kui-color-danger-fill`             |
| `info`    | `--kui-color-info-fill`               |

## Positions

```
top-start    top-center    top-end
bottom-start bottom-center bottom-end   <- default
```

`top-*`: stack grows downward. `bottom-*`: stack grows upward (newest toast closest to viewport edge).

## CSS custom properties

| Token                       | Default                        | Description                     |
| --------------------------- | ------------------------------ | ------------------------------- |
| `--kui-toast-bg`            | `--kui-color-surface-elevated` | Card background                 |
| `--kui-toast-border`        | `--kui-color-border`           | Card border                     |
| `--kui-toast-radius`        | `--kui-radius-md`              | Corner radius                   |
| `--kui-toast-shadow`        | `--kui-shadow-lg`              | Drop shadow                     |
| `--kui-toast-padding-x`     | `--kui-space-4`                | Horizontal padding              |
| `--kui-toast-padding-y`     | `--kui-space-3`                | Vertical padding                |
| `--kui-toast-gap`           | `--kui-space-3`                | Gap between icon / body / close |
| `--kui-toast-stack-gap`     | `--kui-space-2`                | Gap between stacked toasts      |
| `--kui-toast-title-size`    | `--kui-text-sm-size`           | Title font size                 |
| `--kui-toast-message-size`  | `--kui-text-sm-size`           | Message font size               |
| `--kui-toast-region-offset` | `--kui-space-4`                | Offset from viewport edge       |
| `--kui-toast-min-width`     | `280px`                        | Minimum card width              |
| `--kui-toast-max-width`     | `400px`                        | Maximum card width              |

## Behaviour

- **Auto-dismiss:** 5 s by default. Hover on the toast pauses the timer; mouseleave resumes with remaining time.
- **Persistent lifecycle:** `persistent: true`, `persistent: signal(true)`, or `duration: Infinity` keeps a toast open until it is closed or its state changes. Persistent toasts can still be evicted when `maxVisible` is exceeded.
- **Programmatic control:** `KuiToastRef.close()` closes one toast, `update()` changes it in place, and `KuiToast.dismissAll()` closes the service's active toasts.
- **Eviction:** when `maxVisible` is reached, the oldest visible toast is dismissed before the new one appears.
- **No focus steal:** toast does not capture keyboard focus on appear (unlike Dialog).
- **`aria-live="polite"`** on the region, screen readers announce new toasts without interrupting current speech.
- **Mobile:** card stretches to `100vw - 32px`; region ignores position side and aligns to the bottom edge.
- **`prefers-reduced-motion`:** slide animations replaced with opacity-only fade.
- **SSR:** `KuiToast.open()` returns a no-op ref on the server; no DOM access occurs.

## Architecture

`KuiToast` lazily creates a single `KuiToastRegion` on the first `open()` call and appends it to `document.body`. The region lives for the lifetime of the app and manages the toast stack as an Angular signal list.

While toasts are visible the region is a manual popover, so it is shown in the browser top layer, where Dialog, Drawer, Menu and the other library overlays live. A toast added while an overlay is open, or an overlay opened while a toast is visible, raises the region above it (`z-index` has no effect between top-layer elements). `--kui-z-toast` only orders the region in a browser without the Popover API.

```
KuiToast        - @Service(), root-provided
  -> KuiToastRegion  - internal, created via createComponent()
       -> InternalToastItem[] - signal<>, per-item closing signal for exit animation
```

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                           | Default                      | Controls                |
| ------------------------------- | ---------------------------- | ----------------------- |
| `--kui-toast-color`             | `--kui-color-text`           | Color                   |
| `--kui-toast-title-color`       | `--kui-color-text`           | Title color             |
| `--kui-toast-message-color`     | `--kui-color-text-secondary` | Message color           |
| `--kui-toast-close-color`       | `--kui-color-text-secondary` | Close color             |
| `--kui-toast-close-bg-hover`    | `--kui-color-state-hover`    | Close background, hover |
| `--kui-toast-close-color-hover` | `--kui-color-text`           | Close color, hover      |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Provider Defaults

Set `defaults.toast` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    toast: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    toast: {
      /* options below */
    },
  }),
];
```

| Option         | Values                                                                                          | Description                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `position`     | `'top-start' \| 'top-center' \| 'top-end' \| 'bottom-start' \| 'bottom-center' \| 'bottom-end'` | Where the toast region is placed. Follows runtime changes of the default.                                            |
| `duration`     | `number`                                                                                        | Auto-dismiss delay in ms.                                                                                            |
| `maxVisible`   | `number`                                                                                        | Toasts shown at once. Follows runtime changes of the default.                                                        |
| `showProgress` | `boolean`                                                                                       | Shows the remaining-time bar.                                                                                        |
| `closable`     | `boolean`                                                                                       | Shows the close button.                                                                                              |
| `showIcon`     | `boolean`                                                                                       | Shows the status icon.                                                                                               |
| `closeIcon`    | `KuiIconGlyph`                                                                                  | Icon of the close button. Takes precedence over `defaults.icons.close`. See [Structural Icons](structural-icons.md). |

Each option resolves as `local input > defaults.toast.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                      | Default           | Controls            |
| -------------------------- | ----------------- | ------------------- |
| `--kui-toast-close-radius` | `--kui-radius-xs` | Close corner radius |

<!-- geometry-tokens:end -->
