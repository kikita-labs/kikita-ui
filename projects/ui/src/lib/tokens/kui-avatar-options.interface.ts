import type { KuiAvatarShape } from '../components/avatar/kui-avatar-shape.type';
import type { KuiAvatarSize } from '../components/avatar/kui-avatar-size.type';

/** Defaults for `kui-avatar`, set under the `avatar` key of the component defaults. */
export interface KuiAvatarOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiAvatarSize;

  /** Default shape. */
  readonly shape?: KuiAvatarShape;
}
