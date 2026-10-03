import type { KuiCssVariableMap } from '../kui-theme-tokens.interface';

/** Field action, colour input and select tokens. */
export function createPickerTokens(): KuiCssVariableMap {
  return {
    '--kui-field-action-size': '24px',
    '--kui-field-action-icon-size': '14px',
    '--kui-field-action-focus-ring-width': '2px',
    '--kui-field-action-disabled-opacity': '0.5',
    '--kui-color-input-swatch-size-xs': '16px',
    '--kui-color-input-swatch-size': '20px',
    '--kui-color-input-swatch-size-lg': '24px',
    '--kui-color-input-swatch-border-width': '1px',
    '--kui-color-input-checker-size': '8px',
    '--kui-color-input-picker-width': '260px',
    '--kui-color-input-picker-height': '160px',
    '--kui-color-input-preview-swatch-size': '48px',
    '--kui-color-input-thumb-size': '16px',
    '--kui-color-input-hue-track-height': '12px',
    '--kui-select-dropdown-bg': 'var(--kui-color-surface-elevated)',
    '--kui-select-option-selected-bg': 'var(--kui-color-primary-soft-bg)',
    '--kui-select-option-selected-fg': 'var(--kui-color-primary-soft-text)',
    '--kui-select-affordance-size': '20px',
    '--kui-field-clear-icon-size': '12px',
    '--kui-select-suffix-inline-end': '10px',
    '--kui-select-chip-layer-inline-end': '64px',
  };
}
