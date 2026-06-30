import { KuiAvatarStatus } from './kui-avatar-status.type';

/** Data item rendered by `kui-avatar-group`. */
export interface KuiAvatarItem {
  /** Optional image URL. Falls back to initials or icon when loading fails. */
  readonly src?: string;

  /** Human-readable name used for initials, palette hashing, and accessibility. */
  readonly name?: string;

  /** Explicit initials override. Keep this to one or two visible characters. */
  readonly initials?: string;

  /** Optional image alt override. Defaults to `name`. */
  readonly alt?: string;

  /** Optional presence status. */
  readonly status?: KuiAvatarStatus;

  /** Optional palette slot from 1 to 7. Defaults to a stable hash of the name. */
  readonly paletteIndex?: number;
}
