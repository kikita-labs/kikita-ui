import { InjectionToken } from '@angular/core';

import type { KuiLocaleSource, KuiMessagesSource } from './kui-messages.interface';

/** Locale and messages written by one provider on one injector level. */
export interface KuiI18nOptions {
  /** Locale for formatting and plural rules. Inherited from the parent level when omitted. */
  readonly locale?: KuiLocaleSource;

  /** Message overrides, merged over the parent level per group and per key. */
  readonly messages?: KuiMessagesSource;
}

/**
 * @internal
 * Initial options of one injector level, in provider order. `KuiI18n` reads them with
 * `self: true`, so a nested level never inherits the seeds of its parent and several providers on
 * one level combine, the later one winning per key.
 */
export const KUI_I18N_SEED = new InjectionToken<readonly KuiI18nOptions[]>('KUI_I18N_SEED');
