import type { KuiThemeOptions } from '../kui-theme-options.interface';
import type { KuiCssVariableMap } from '../kui-theme-tokens.interface';
import { createContentTokens } from './kui-theme-content-tokens';
import { createFieldTokens } from './kui-theme-field-tokens';
import { createFoundationTokens } from './kui-theme-foundation-tokens';
import { createOverlayTokens } from './kui-theme-overlay-tokens';
import { createPickerTokens } from './kui-theme-picker-tokens';

/** The literal component and foundation tokens, in the order they are written to CSS. */
export function createComponentVariables(options: KuiThemeOptions): KuiCssVariableMap {
  return {
    ...createFoundationTokens(options),
    ...createFieldTokens(),
    ...createContentTokens(),
    ...createPickerTokens(),
    ...createOverlayTokens(),
  };
}
