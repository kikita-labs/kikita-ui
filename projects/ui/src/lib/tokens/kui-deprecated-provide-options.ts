import type { Provider } from '@angular/core';

import type { KuiButtonProviderOptions } from '../components/button/kui-button-options.interface';
import type { KuiComboboxOptions } from '../components/combobox/kui-combobox-options.interface';
import type { KuiFieldOptions } from '../components/field/kui-field-options.interface';
import type { KuiSelectOptions } from '../components/select/kui-select-options.interface';
import type { KuiToastOptions } from '../components/toast/kui-toast.types';
import type { KuiTooltipOptions } from '../components/tooltip/kui-tooltip-options.interface';
import { provideKuiDefaults } from '../providers/provide-kui-defaults';

/**
 * Provides scoped defaults for descendant Kikita UI button primitives.
 *
 * @deprecated Use `provideKuiDefaults({ button, iconButton })`. Planned removal in 3.0.
 */
export function kuiProvideButtonOptions(opts: KuiButtonProviderOptions): Provider[] {
  return provideKuiDefaults({ button: opts.button, iconButton: opts.iconButton });
}

/**
 * Provides field option defaults for a subtree.
 *
 * @deprecated Use `provideKuiDefaults({ field })`. Planned removal in 3.0.
 */
export function kuiProvideFieldOptions(opts: KuiFieldOptions): Provider[] {
  return provideKuiDefaults({ field: opts });
}

/**
 * Provides defaults for `input[kuiSelect]` controls.
 *
 * @deprecated Use `provideKuiDefaults({ select })`. Planned removal in 3.0.
 */
export function kuiProvideSelectOptions(opts: KuiSelectOptions): Provider[] {
  return provideKuiDefaults({ select: opts });
}

/**
 * Provides defaults for `input[kuiCombobox]` controls.
 *
 * @deprecated Use `provideKuiDefaults({ combobox })`. Planned removal in 3.0.
 */
export function kuiProvideComboboxOptions(opts: KuiComboboxOptions): Provider[] {
  return provideKuiDefaults({ combobox: opts });
}

/**
 * Provides scoped defaults for descendant `kuiTooltip` directives.
 *
 * @deprecated Use `provideKuiDefaults({ tooltip })`. Planned removal in 3.0.
 */
export function kuiProvideTooltipOptions(opts: KuiTooltipOptions): Provider[] {
  return provideKuiDefaults({ tooltip: opts });
}

/**
 * Provides defaults for toasts opened in the current injector scope.
 *
 * @deprecated Use `provideKuiDefaults({ toast })`. Planned removal in 3.0.
 */
export function provideKuiToastOptions(opts: KuiToastOptions): Provider[] {
  return provideKuiDefaults({ toast: opts });
}
