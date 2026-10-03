import type { Provider } from '@angular/core';

import type { KuiButtonProviderOptions } from '../components/button/kui-button-options.interface';
import type { KuiComboboxOptions } from '../components/combobox/kui-combobox-options.interface';
import type { KuiFieldOptions } from '../components/field/kui-field-options.interface';
import type { KuiSelectOptions } from '../components/select/kui-select-options.interface';
import type { KuiToastOptions } from '../components/toast/kui-toast.types';
import type { KuiTooltipOptions } from '../components/tooltip/kui-tooltip-options.interface';
import { kuiProvideDefaults } from '../providers/provide-kui-defaults';

/**
 * Provides scoped defaults for descendant Kikita UI button primitives.
 *
 * @deprecated Use `kuiProvideDefaults({ button, iconButton })`. Planned removal in 3.0.
 */
export function kuiProvideButtonOptions(opts: KuiButtonProviderOptions): Provider[] {
  return kuiProvideDefaults({ button: opts.button, iconButton: opts.iconButton });
}

/**
 * Provides field option defaults for a subtree.
 *
 * @deprecated Use `kuiProvideDefaults({ field })`. Planned removal in 3.0.
 */
export function kuiProvideFieldOptions(opts: KuiFieldOptions): Provider[] {
  return kuiProvideDefaults({ field: opts });
}

/**
 * Provides defaults for `input[kuiSelect]` controls.
 *
 * @deprecated Use `kuiProvideDefaults({ select })`. Planned removal in 3.0.
 */
export function kuiProvideSelectOptions(opts: KuiSelectOptions): Provider[] {
  return kuiProvideDefaults({ select: opts });
}

/**
 * Provides defaults for `input[kuiCombobox]` controls.
 *
 * @deprecated Use `kuiProvideDefaults({ combobox })`. Planned removal in 3.0.
 */
export function kuiProvideComboboxOptions(opts: KuiComboboxOptions): Provider[] {
  return kuiProvideDefaults({ combobox: opts });
}

/**
 * Provides scoped defaults for descendant `kuiTooltip` directives.
 *
 * @deprecated Use `kuiProvideDefaults({ tooltip })`. Planned removal in 3.0.
 */
export function kuiProvideTooltipOptions(opts: KuiTooltipOptions): Provider[] {
  return kuiProvideDefaults({ tooltip: opts });
}

/**
 * Provides defaults for toasts opened in the current injector scope.
 *
 * @deprecated Use `kuiProvideDefaults({ toast })`. Planned removal in 3.0.
 */
export function provideKuiToastOptions(opts: KuiToastOptions): Provider[] {
  return kuiProvideDefaults({ toast: opts });
}
