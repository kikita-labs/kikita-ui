import type { KuiAvatarShape } from '../components/avatar/kui-avatar-shape.type';
import type { KuiAvatarSize } from '../components/avatar/kui-avatar-size.type';

/** Defaults for `kui-avatar-group`, set under the `avatarGroup` key of the component defaults. */
export interface KuiAvatarGroupOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiAvatarSize;

  /** Default shape. */
  readonly shape?: KuiAvatarShape;

  /** Maximum avatars shown before the overflow counter. */
  readonly max?: number;
}
