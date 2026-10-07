import type { KuiSize } from '../../types';

/** Defaults for `kui-otp-input`, set under the `otpInput` key of the component defaults. */
export interface KuiOtpInputOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Masks the entered characters. */
  readonly mask?: boolean;

  /** Accepts digits only. */
  readonly integerOnly?: boolean;
}
