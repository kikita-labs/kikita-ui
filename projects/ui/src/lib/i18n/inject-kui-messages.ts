import type { Signal } from '@angular/core';
import { inject } from '@angular/core';

import { KuiI18n } from './kui-i18n';
import type { KuiBoundMessages, KuiMessages } from './kui-messages.interface';

/**
 * @internal
 * Reads one message group in a component. `instance` supplies the component's own `messages`
 * input, which wins over every level; function messages come back with the locale helpers applied.
 */
export function injectKuiMessages<TGroup extends keyof KuiMessages>(
  group: TGroup,
  instance?: () => Partial<KuiMessages[TGroup]> | undefined,
): Signal<KuiBoundMessages<KuiMessages[TGroup]>> {
  return inject(KuiI18n).get(group, instance);
}
