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

| Input         | Type                       | Default      | Notes                                                                  |
| ------------- | -------------------------- | ------------ | ---------------------------------------------------------------------- |
| `variant`     | `'dropzone' \| 'compact'`  | `'dropzone'` | `dropzone`: full drag-and-drop zone. `compact`: trigger button only.   |
| `mode`        | `'single' \| 'multiple'`   | `'multiple'` | `single`: re-selecting replaces the current file.                      |
| `accept`      | `readonly string[]`        | `undefined`  | Allowed MIME types. Omit to accept any file type.                      |
| `acceptLabel` | `string`                   | `undefined`  | Format/limit hint text rendered under the dropzone or compact trigger. |
| `maxSize`     | `number` (bytes)           | `undefined`  | Maximum file size.                                                     |
| `maxCount`    | `number`                   | `undefined`  | Maximum file count (`multiple` mode only).                             |
| `size`        | `KuiSize`                  | `'md'`       | Row height/thumbnail size; only `sm`/`md`/`lg` have dedicated styling. |
| `disabled`    | `boolean`                  | `false`      | Dropzone/trigger stop reacting to drag, click, and keyboard.           |
| `files`       | `readonly KuiUploadFile[]` | `[]`         | Controlled file list. Two-way (`filesChange`).                         |

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

| Key                    | Action                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `Enter` / `Space`      | On the dropzone or "Choose file"/"Attach file" button — opens the native file picker. |
| `Tab`                  | Moves between the trigger, each file item, and its remove button.                     |
| `Delete` / `Backspace` | Removes the focused file item.                                                        |

## Accessibility

The visible dropzone/button controls a visually hidden native
`<input type="file">` — drag-and-drop is never the only way to select a
file. The dropzone is `role="button"` with an `aria-label` that includes
`acceptLabel` when set. Upload progress reuses `kui-progress`
(`role="progressbar"`, `aria-valuenow`) with an
`aria-label="Uploading {name}"`. The file list is wrapped in
`aria-live="polite"` so additions/removals are announced, and the
`maxCount` form error is its own `aria-live="polite"` region. The remove
button has `aria-label="Remove {name}"`.

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
