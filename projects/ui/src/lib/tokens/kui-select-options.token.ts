import { InjectionToken } from '@angular/core';

import type { KuiFieldOptions } from './kui-field-options.token';

/** Defaults specific to `input[kuiSelect]` controls. Extends {@link KuiFieldOptions}. */
export interface KuiSelectOptions extends KuiFieldOptions {
  /** Placeholder text rendered when the dropdown has no matching options. */
  emptyText?: string;
}

/** Injection token for `input[kuiSelect]` defaults. Takes precedence over {@link KUI_FIELD_OPTIONS}. */
export const KUI_SELECT_OPTIONS = new InjectionToken<KuiSelectOptions>('KUI_SELECT_OPTIONS');
