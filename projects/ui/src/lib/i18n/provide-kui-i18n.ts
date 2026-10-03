import type { Provider } from '@angular/core';

import { KuiI18n } from './kui-i18n.service';
import type { KuiI18nOptions } from './kui-i18n.token';
import { KUI_I18N_SEED } from './kui-i18n.token';
import type { KuiLocaleSource, KuiMessagesSource } from './kui-messages.interface';

/**
 * Adds a locale and message level for a subtree.
 *
 * Use it in `providers` of a component, a route or an environment injector. The level merges its
 * messages over the ones it inherits per group and per key, and inherits the locale unless it sets
 * one. Two subtrees never affect each other.
 *
 * @example
 * ```ts
 * @Component({
 *   providers: [kuiProvideI18n({ locale: 'de-DE', messages: { pagination: { next: 'Weiter' } } })],
 * })
 * ```
 */
export function kuiProvideI18n(options: KuiI18nOptions): Provider[] {
  return [KuiI18n, { provide: KUI_I18N_SEED, multi: true, useValue: options }];
}

/**
 * Sets the locale for the whole app, or for a subtree when added to a component's `providers`.
 * A component-level `locale` input, where available, takes precedence.
 *
 * @example
 * ```ts
 * // app.config.ts
 * providers: [kuiProvideLocale('ru-RU')]
 * ```
 */
export function kuiProvideLocale(locale: KuiLocaleSource): Provider[] {
  return kuiProvideI18n({ locale });
}

/**
 * Overrides library messages for a subtree. Pass a `Signal` to follow the application's language.
 *
 * @example
 * ```ts
 * providers: [kuiProvideMessages({ pagination: { next: 'Weiter', previous: 'Zurück' } })]
 * ```
 */
export function kuiProvideMessages(messages: KuiMessagesSource): Provider[] {
  return kuiProvideI18n({ messages });
}
