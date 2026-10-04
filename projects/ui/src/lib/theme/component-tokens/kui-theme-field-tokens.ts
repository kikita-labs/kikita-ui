import type { KuiCssVariableMap } from '../kui-theme-tokens.interface';

/** Group, field, input, checkbox, radio and switch tokens. */
export function createFieldTokens(): KuiCssVariableMap {
  return {
    '--kui-group-collapsed-gap': '-1px',
    '--kui-field-affix-icon-size': '16px',
    '--kui-field-affix-max-inline-size': '40%',
    '--kui-field-message-icon-size': '12px',
    '--kui-field-message-icon-offset': '1px',
    '--kui-field-spinner-size': '14px',
    '--kui-field-spinner-border-width': '2px',
    '--kui-field-spinner-duration': '800ms',
    '--kui-field-spinner-duration-reduced': '2000ms',
    '--kui-input-border-width': '1px',
    '--kui-input-border-width-focus': '1px',
    '--kui-checkbox-size': '18px',
    '--kui-checkbox-border-width': '1px',
    '--kui-radio-border-width': '1px',
    '--kui-switch-thumb-offset': '2px',
    '--kui-switch-radius': '999px',
    '--kui-switch-border-width': '1px',
    '--kui-switch-thumb-shadow': '0 1px 2px oklch(0 0 0 / 0.22)',
  };
}
