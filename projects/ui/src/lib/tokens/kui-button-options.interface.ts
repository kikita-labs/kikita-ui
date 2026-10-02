import type { Provider } from '@angular/core';
import { InjectionToken } from '@angular/core';

import type { KuiButtonAppearance } from '../components/button/kui-button-appearance.type';
import type { KuiButtonShape } from '../components/button/kui-button-shape.type';
import type { KuiSize } from '../types';

/** Default options for button-like primitives when local inputs are omitted. */
export interface KuiButtonPrimitiveOptions {
  /** Default surface shape. */
  readonly shape?: KuiButtonShape;

  /** Default semantic color intent. Use `null` for each shape's neutral/default appearance. */
  readonly appearance?: KuiButtonAppearance | null;

  /** Default button size. Takes precedence over root `provideKikitaUi({ defaults.size })`. */
  readonly size?: KuiSize;
}

/** Default options for Kikita UI button primitives when local inputs are omitted. */
export interface KuiButtonOptions {
  /** Defaults for `button[kuiButton]`. */
  readonly button?: KuiButtonPrimitiveOptions;

  /** Defaults for `button[kuiIconButton]`. */
  readonly iconButton?: KuiButtonPrimitiveOptions;
}

/** Injection token for button primitive defaults. */
export const KUI_BUTTON_OPTIONS = new InjectionToken<KuiButtonOptions>('KUI_BUTTON_OPTIONS');

/** Provides scoped defaults for descendant Kikita UI button primitives. */
export function kuiProvideButtonOptions(opts: KuiButtonOptions): Provider {
  return { provide: KUI_BUTTON_OPTIONS, useValue: opts };
}
