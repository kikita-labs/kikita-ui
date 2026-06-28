# Toast

Non-blocking notifications displayed over the interface. Imperatively opened via `kuiToast()`. Auto-dismiss with optional hover-pause and progress bar.

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
    provideKuiToastOptions({
      position: 'top-end',
      duration: 4000,
      maxVisible: 5,
    }),
  ],
};
```

## KuiToastConfig

| Property       | Type                 | Default     | Description                                                   |
| -------------- | -------------------- | ----------- | ------------------------------------------------------------- |
| `title`        | `string`             | —           | **Required.** Headline text.                                  |
| `message`      | `string`             | —           | Supporting text below the title.                              |
| `appearance`   | `KuiToastAppearance` | `'neutral'` | Visual intent — controls accent bar and icon colour.          |
| `actionLabel`  | `string`             | —           | Label for inline action button. Clicking emits `ref.action$`. |
| `duration`     | `number`             | `5000`      | Auto-dismiss delay in ms.                                     |
| `persistent`   | `boolean`            | `false`     | Keep the toast until the user closes it.                      |
| `closable`     | `boolean`            | `true`      | Show the × close button.                                      |
| `showIcon`     | `boolean`            | `true`      | Show the appearance icon (neutral has no icon).               |
| `showProgress` | `boolean`            | `false`     | Show a progress bar tracking time until auto-dismiss.         |

## KuiToastRef

```ts
interface KuiToastRef {
  close(): void;
  readonly closed$: Observable<void>;
  readonly action$: Observable<void>;
}
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
bottom-start bottom-center bottom-end   ← default
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
- **Eviction:** when `maxVisible` is reached, the oldest visible toast is dismissed before the new one appears.
- **No focus steal:** toast does not capture keyboard focus on appear (unlike Dialog).
- **`aria-live="polite"`** on the region — screen readers announce new toasts without interrupting current speech.
- **Mobile:** card stretches to `100vw − 32px`; region ignores position side and aligns to the bottom edge.
- **`prefers-reduced-motion`:** slide animations replaced with opacity-only fade.
- **SSR:** `KuiToastService.open()` returns a no-op ref on the server; no DOM access occurs.

## Architecture

`KuiToastService` lazily creates a single `KuiToastRegionComponent` on the first `open()` call and appends it to `document.body`. The region lives for the lifetime of the app and manages the toast stack as an Angular signal list.

```
KuiToastService        — @Service(), root-provided
  └─ KuiToastRegionComponent  — internal, created via createComponent()
       └─ InternalToastItem[] — signal<>, per-item closing signal for exit animation
```
