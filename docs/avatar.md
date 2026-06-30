# Avatar

`kui-avatar` renders a compact visual identity for a user or entity. It follows the Claude
Avatar spec: image first, initials fallback, icon fallback, tokenized palette slots, optional
presence status, and grouped avatar stacks.

## Import

```ts
import { KuiAvatarComponent, KuiAvatarGroupComponent } from '@kikita-labs/ui';
```

Import the public stylesheet once:

```scss
@import '@kikita-labs/ui/styles/kikita-ui.css';
```

## Basic Usage

```html
<kui-avatar src="/users/nikita.png" name="Nikita Repin" status="online" />
<kui-avatar name="Anya Murashova" />
<kui-avatar />
```

Image avatars render a native `<img>`. If the image fails to load, the component falls back to
initials generated from `name`, then to the icon fallback when no initials are available.

## Sizes And Shapes

```html
<kui-avatar name="Nikita Repin" size="xs" />
<kui-avatar name="Nikita Repin" size="sm" />
<kui-avatar name="Nikita Repin" size="md" />
<kui-avatar name="Nikita Repin" size="lg" />
<kui-avatar name="Nikita Repin" size="xl" />
<kui-avatar name="Nikita Repin" size="2xl" />

<kui-avatar name="Design Bot" shape="square" />
```

`circle` is the default shape for people. `square` is intended for entities such as bots,
teams, channels, and projects.

## Status

```html
<kui-avatar name="Nikita Repin" status="online" />
<kui-avatar name="Nikita Repin" status="away" />
<kui-avatar name="Nikita Repin" status="busy" />
<kui-avatar name="Nikita Repin" status="offline" />
```

The visual status dot is decorative and hidden from assistive technology. The status text is
included in the avatar accessible label.

## Avatar Group

```html
<kui-avatar-group [avatars]="members" [max]="4" size="sm" label="Project participants" />
```

```ts
readonly members = [
  { src: '/users/nikita.png', name: 'Nikita Repin', status: 'online' },
  { name: 'Anya Murashova', status: 'away' },
  { name: 'Timur Ognev' },
  { name: 'Vera Saltykova' },
  { name: 'Ilya Denisov' },
];
```

When the number of items exceeds `max`, the group renders a `+N` overflow avatar with an
accessible label such as `2 more`.

## Button-Backed Avatar

Use a native button when the avatar is interactive.

```html
<button class="kui-avatar-action" type="button" aria-label="Open Nikita Repin profile">
  <kui-avatar src="/users/nikita.png" name="Nikita Repin" />
</button>
```

Do not make the custom `kui-avatar` element itself clickable. Keeping the button outside
preserves native keyboard and accessibility behavior.

## API

### `kui-avatar`

| Input          | Type                                            | Default     | Description                                      |
| -------------- | ----------------------------------------------- | ----------- | ------------------------------------------------ |
| `src`          | `string \| undefined`                           | `undefined` | Image URL. Falls back on load error.             |
| `name`         | `string \| undefined`                           | `undefined` | Used for initials, palette hashing, and label.   |
| `initials`     | `string \| undefined`                           | auto        | Explicit one or two character initials.          |
| `alt`          | `string \| undefined`                           | `name`      | Image alt and accessible label override.         |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'`      | Fixed avatar size.                               |
| `shape`        | `'circle' \| 'square'`                          | `'circle'`  | Avatar shape.                                    |
| `status`       | `'online' \| 'away' \| 'busy' \| 'offline'`     | `undefined` | Optional presence indicator.                     |
| `paletteIndex` | `number \| undefined`                           | auto        | Palette slot from 1 to 7. Clamped when explicit. |
| `loading`      | `boolean`                                       | `false`     | Shows skeleton shimmer and hides avatar content. |

### `kui-avatar-group`

| Input     | Type                       | Default          | Description                                 |
| --------- | -------------------------- | ---------------- | ------------------------------------------- |
| `avatars` | `readonly KuiAvatarItem[]` | `[]`             | Items rendered by the group.                |
| `max`     | `number`                   | `4`              | Maximum visible avatars before overflow.    |
| `size`    | `KuiAvatarSize`            | `'md'`           | Size applied to every avatar in the group.  |
| `shape`   | `KuiAvatarShape`           | `'circle'`       | Shape applied to every avatar in the group. |
| `label`   | `string`                   | `'Avatar group'` | Accessible group label.                     |

## Accessibility

- Image avatars render a native `<img>` with `alt` derived from `alt`, then `name`.
- Initials and icon fallback avatars expose `role="img"` and `aria-label`.
- Status is appended to the accessible label, for example `Nikita Repin, online`.
- The status dot is decorative.
- Interactive avatars must use a native `<button>` wrapper with `aria-label`.

## Tokens

Avatar styles consume `--kui-*` variables only. Key component tokens:

- `--kui-avatar-size-*`
- `--kui-avatar-font-size-*`
- `--kui-avatar-radius-circle`
- `--kui-avatar-radius-square`
- `--kui-avatar-bg-fallback`
- `--kui-avatar-icon-color`
- `--kui-avatar-status-border`
- `--kui-avatar-status-size-*`
- `--kui-avatar-overflow-bg`
- `--kui-avatar-overflow-text`
- `--kui-avatar-p1-bg` through `--kui-avatar-p7-bg`
- `--kui-avatar-p1-fg` through `--kui-avatar-p7-fg`
