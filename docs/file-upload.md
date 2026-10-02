# File Upload

`kui-file-upload` picks files through a drag-and-drop dropzone or a compact
button trigger, validates them against `accept`/`maxSize`/`maxCount`, and
lists them with per-item progress, success, and error state.

`kui-file-upload` never performs network transport itself. It is a
**controlled** component: new selections are appended to the two-way `files`
model as `pending` (or `error`, when client-side validation fails). The
consumer drives the actual upload by writing `uploading`/`success`/`error`
and `progress` back onto the same entries, and restarts a failed one in
response to `(retry)`.

## Import

```ts
import { KuiFileUploadComponent } from '@kikita-labs/ui';
```

## Usage

```html
<kui-file-upload
  acceptLabel="PNG, JPG up to 10 MB"
  [accept]="['image/png', 'image/jpeg']"
  [maxSize]="10 * 1024 * 1024"
  [maxCount]="5"
  [(files)]="files"
  (retry)="onRetry($event)"
/>
```

```ts
protected readonly files = signal<KuiUploadFile[]>([]);

protected onRetry(entry: KuiUploadFile): void {
  this.startUpload(entry);
}

private startUpload(entry: KuiUploadFile): void {
  this.files.update((list) =>
    list.map((f) => (f.id === entry.id ? { ...f, status: 'uploading', progress: 0 } : f)),
  );

  // Drive `entry.file` through your own transport, updating `progress` as it
  // advances and setting `status` to 'success' or 'error' (with `errorMsg`)
  // when it settles.
}
```

A newly picked or dropped file lands in the model as `pending`; wire a
`files` effect (or watch `filesChange` via two-way binding) to notice new
`pending` entries and call `startUpload` on them the same way `onRetry` does.

## Compact Variant

```html
<kui-file-upload variant="compact" acceptLabel="Any file up to 5 MB" [(files)]="files" />
```

`compact` renders only the trigger button and hint text — no drag-and-drop
zone — for dense forms and comment composers. It shares the same picker,
validation, and file list as `dropzone`.

## Single Mode

```html
<kui-file-upload mode="single" [(files)]="files" />
```

In `single` mode, picking or dropping a new file always replaces the current
one instead of appending to the list; `maxCount` is ignored.

## In `kui-field`

```html
<kui-field label="Verification document" required>
  <kui-file-upload acceptLabel="PDF up to 10 MB" [accept]="['application/pdf']" [(files)]="files" />
</kui-field>
```

`kui-file-upload` does not implement an Angular Signal Forms control
contract; it is plain projected content inside `kui-field` (see Known Gaps).

## Inputs

| Input         | Type                       | Default      | Notes                                                                                                                     |
| ------------- | -------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `variant`     | `'dropzone' \| 'compact'`  | `'dropzone'` | `dropzone`: full drag-and-drop zone. `compact`: trigger button only.                                                      |
| `mode`        | `'single' \| 'multiple'`   | `'multiple'` | `single`: re-selecting replaces the current file.                                                                         |
| `accept`      | `readonly string[]`        | `undefined`  | Allowed MIME types. Omit to accept any file type.                                                                         |
| `acceptLabel` | `string`                   | `undefined`  | Format/limit hint text rendered under the dropzone or compact trigger.                                                    |
| `maxSize`     | `number` (bytes)           | `undefined`  | Maximum file size. Static numeric values are coerced; invalid/non-positive values omit the limit.                         |
| `maxCount`    | `number`                   | `undefined`  | Maximum file count (`multiple` mode only). Static numeric values are coerced; invalid/non-positive values omit the limit. |
| `size`        | `KuiSize`                  | `'md'`       | Row height/thumbnail size; only `sm`/`md`/`lg` have dedicated styling.                                                    |
| `disabled`    | `boolean`                  | `false`      | Dropzone/trigger stop reacting to drag, click, and keyboard.                                                              |
| `files`       | `readonly KuiUploadFile[]` | `[]`         | Controlled file list. Two-way (`filesChange`).                                                                            |

## Outputs

| Output  | Payload         | Notes                                                                                                                                                     |
| ------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retry` | `KuiUploadFile` | Fires when an errored item's Retry action is activated. Does not itself change `files` — the consumer restarts the upload and writes the new status back. |

### `KuiUploadFile`

| Field      | Type                                               | Notes                                                                  |
| ---------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| `id`       | `string`                                           | Stable id, unique within the component instance.                       |
| `file`     | `File`                                             | The native `File`, so the consumer can actually read/upload its bytes. |
| `name`     | `string`                                           | Mirrors `file.name`.                                                   |
| `size`     | `number`                                           | Mirrors `file.size` in bytes.                                          |
| `type`     | `string`                                           | Mirrors `file.type`.                                                   |
| `status`   | `'pending' \| 'uploading' \| 'success' \| 'error'` | Owned by the consumer past the initial `pending`/`error` from picking. |
| `progress` | `number` (0-100)                                   | Only meaningful while `status` is `uploading`.                         |
| `errorMsg` | `string`                                           | Only meaningful while `status` is `error`.                             |

## Keyboard

| Key                    | Action                                                                      |
| ---------------------- | --------------------------------------------------------------------------- |
| `Enter` / `Space`      | On the dropzone or the "Attach file" button — opens the native file picker. |
| `Tab`                  | Moves between the trigger, each file item, and its remove button.           |
| `Delete` / `Backspace` | Removes the focused file item.                                              |

## Accessibility

The visible dropzone/button controls a visually hidden native
`<input type="file">` — drag-and-drop is never the only way to select a
file. The native input is `aria-hidden` and out of the tab order; the dropzone
(or the compact "Attach file" button) is the control. The dropzone is
`role="button"` with an `aria-label` that includes `acceptLabel` when set. The
small "Choose file" label inside it is presentational (`aria-hidden`), not a
second button, so a click on it reaches the dropzone and no interactive control
is nested inside another. Upload progress reuses `kui-progress`
(`role="progressbar"`, `aria-valuenow`) with an
`aria-label="Uploading {name}"`. The file list is wrapped in
`aria-live="polite"` so additions/removals are announced, and the
`maxCount` form error is its own `aria-live="polite"` region. The remove
button has `aria-label="Remove {name}"`.

The errored-item Retry control is a native `button[kuiLink]` with caption
typography and an always-visible underline. It remains an action: it has
`type="button"`, does not navigate or submit a surrounding form, and emits the
same `retry` payload for the consumer-owned upload restart.

## Known Gaps

- Does not implement an Angular Signal Forms control contract. `files` is a
  plain two-way `model()` — wrap it in your own Signal Forms field if you
  need required/validation state to compose with `kui-field`'s automatic
  error message.
- No upload transport of any kind is built in; see Usage for the expected
  `pending` → `uploading` → `success`/`error` handshake with the consumer.

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```

File Upload styles live in `projects/ui/src/styles/file-upload.css` and are
included through `@kikita-labs/ui/styles`. The upload progress bar reuses
`kui-progress` directly (its own `--kui-progress-*` tokens) — no separate
progress-color token is introduced for File Upload. The remove button reuses
`.kui-field-action` (Field Affixes).

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                            | Default                         | Controls                       |
| ------------------------------------------------ | ------------------------------- | ------------------------------ |
| `--kui-file-upload-dropzone-bg-hover`            | `--kui-color-surface`           | Dropzone background, hover     |
| `--kui-file-upload-dropzone-focus-ring-color`    | `--kui-color-focus`             | Dropzone focus ring color      |
| `--kui-file-upload-dropzone-border-over`         | `--kui-color-primary-indicator` | Dropzone border color, over    |
| `--kui-file-upload-dropzone-bg-over`             | `--kui-color-primary-soft-bg`   | Dropzone background, over      |
| `--kui-file-upload-dropzone-border-invalid`      | `--kui-color-danger-indicator`  | Dropzone border color, invalid |
| `--kui-file-upload-dropzone-bg-invalid`          | `--kui-color-danger-soft-bg`    | Dropzone background, invalid   |
| `--kui-file-upload-dropzone-icon-color`          | `--kui-color-text-secondary`    | Dropzone icon color            |
| `--kui-file-upload-dropzone-icon-color-over`     | `--kui-color-primary-text`      | Dropzone icon color, over      |
| `--kui-file-upload-dropzone-icon-color-invalid`  | `--kui-color-danger-text`       | Dropzone icon color, invalid   |
| `--kui-file-upload-dropzone-text-color`          | `--kui-color-text`              | Dropzone text color            |
| `--kui-file-upload-dropzone-text-emphasis-color` | `--kui-color-primary-soft-text` | Dropzone text emphasis color   |
| `--kui-file-upload-dropzone-hint-color`          | `--kui-color-text-secondary`    | Dropzone hint color            |
| `--kui-file-upload-compact-hint-color`           | `--kui-color-text-secondary`    | Compact hint color             |
| `--kui-file-upload-form-error-color`             | `--kui-color-danger-text`       | Form error color               |
| `--kui-file-upload-item-border`                  | `--kui-color-border`            | Item border color              |
| `--kui-file-upload-item-bg`                      | `--kui-color-surface`           | Item background                |
| `--kui-file-upload-item-focus-ring-color`        | `--kui-color-focus`             | Item focus ring color          |
| `--kui-file-upload-item-preview-bg`              | `--kui-color-surface-elevated`  | Item preview background        |
| `--kui-file-upload-item-preview-color`           | `--kui-color-text-secondary`    | Item preview color             |
| `--kui-file-upload-item-preview-bg-pdf`          | `--kui-color-danger-soft-bg`    | Item preview background, pdf   |
| `--kui-file-upload-item-preview-color-pdf`       | `--kui-color-danger-soft-text`  | Item preview color, pdf        |
| `--kui-file-upload-item-preview-bg-doc`          | `--kui-color-info-soft-bg`      | Item preview background, doc   |
| `--kui-file-upload-item-preview-color-doc`       | `--kui-color-info-soft-text`    | Item preview color, doc        |
| `--kui-file-upload-item-preview-bg-zip`          | `--kui-color-warning-soft-bg`   | Item preview background, zip   |
| `--kui-file-upload-item-preview-color-zip`       | `--kui-color-warning-soft-text` | Item preview color, zip        |
| `--kui-file-upload-item-name-color`              | `--kui-color-text`              | Item name color                |
| `--kui-file-upload-item-meta-color`              | `--kui-color-text-secondary`    | Item meta color                |
| `--kui-file-upload-item-success-color`           | `--kui-color-success-text`      | Item success color             |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                          | Default               | Controls                    |
| ---------------------------------------------- | --------------------- | --------------------------- |
| `--kui-file-upload-gap`                        | `--kui-space-4`       | Gap                         |
| `--kui-file-upload-dropzone-padding-block`     | `--kui-space-8`       | Dropzone padding, block     |
| `--kui-file-upload-dropzone-padding-inline`    | `--kui-space-6`       | Dropzone padding, inline    |
| `--kui-file-upload-dropzone-gap`               | `--kui-space-2`       | Dropzone gap                |
| `--kui-file-upload-dropzone-padding-has-files` | `--kui-space-4`       | Dropzone padding, has files |
| `--kui-file-upload-dropzone-text-font-size`    | `--kui-text-sm-size`  | Dropzone text font size     |
| `--kui-file-upload-dropzone-hint-font-size`    | `--kui-text-xs-size`  | Dropzone hint font size     |
| `--kui-file-upload-compact-trigger-gap`        | `--kui-space-3`       | Compact trigger gap         |
| `--kui-file-upload-compact-hint-font-size`     | `--kui-text-xs-size`  | Compact hint font size      |
| `--kui-file-upload-form-error-font-size`       | `--kui-text-xs-size`  | Form error font size        |
| `--kui-file-upload-list-gap`                   | `--kui-space-2`       | List gap                    |
| `--kui-file-upload-item-gap`                   | `--kui-space-3`       | Item gap                    |
| `--kui-file-upload-item-padding-block`         | `--kui-space-2`       | Item padding, block         |
| `--kui-file-upload-item-padding-inline`        | `--kui-space-3`       | Item padding, inline        |
| `--kui-file-upload-item-radius`                | `--kui-radius-md`     | Item corner radius          |
| `--kui-file-upload-item-preview-radius`        | `--kui-radius-sm`     | Item preview corner radius  |
| `--kui-file-upload-item-preview-font-size`     | `--kui-text-2xs-size` | Item preview font size      |
| `--kui-file-upload-item-name-font-size`        | `--kui-text-sm-size`  | Item name font size         |
| `--kui-file-upload-item-meta-gap`              | `--kui-space-2`       | Item meta gap               |
| `--kui-file-upload-item-meta-font-size`        | `--kui-text-xs-size`  | Item meta font size         |
| `--kui-file-upload-item-error-gap`             | `--kui-space-2`       | Item error gap              |
| `--kui-file-upload-dropzone-padding-block-sm`  | `--kui-space-5`       | Dropzone padding, block sm  |
| `--kui-file-upload-dropzone-padding-inline-sm` | `--kui-space-4`       | Dropzone padding, inline sm |
| `--kui-file-upload-dropzone-gap-sm`            | `--kui-space-1`       | Dropzone gap, sm            |
| `--kui-file-upload-dropzone-text-font-size-sm` | `--kui-text-xs-size`  | Dropzone text font size, sm |
| `--kui-file-upload-item-name-font-size-sm`     | `--kui-text-xs-size`  | Item name font size, sm     |
| `--kui-file-upload-dropzone-padding-block-lg`  | `--kui-space-12`      | Dropzone padding, block lg  |
| `--kui-file-upload-dropzone-padding-inline-lg` | `--kui-space-8`       | Dropzone padding, inline lg |
| `--kui-file-upload-dropzone-gap-lg`            | `--kui-space-3`       | Dropzone gap, lg            |
| `--kui-file-upload-dropzone-text-font-size-lg` | `--kui-text-md-size`  | Dropzone text font size, lg |
| `--kui-file-upload-item-name-font-size-lg`     | `--kui-text-md-size`  | Item name font size, lg     |

<!-- geometry-tokens:end -->
