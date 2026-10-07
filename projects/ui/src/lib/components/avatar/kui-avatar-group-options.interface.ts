import type { KuiAvatarShape } from './kui-avatar-shape.type';
import type { KuiAvatarSize } from './kui-avatar-size.type';

/** Defaults for `kui-avatar-group`, set under the `avatarGroup` key of the component defaults. */
export interface KuiAvatarGroupOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiAvatarSize;

  /** Default shape. */
  readonly shape?: KuiAvatarShape;

  /** Maximum avatars shown before the overflow counter. */
  readonly max?: number;
}
