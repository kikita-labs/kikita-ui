import { type SchemaPathTree, validate } from '@angular/forms/signals';

import type { SwitchFormModel } from '../interfaces';

/** Creates a localized rule requiring account alerts to be enabled. */
export function createSwitchSchema(
  activationMessage: () => string,
): (path: SchemaPathTree<SwitchFormModel>) => void {
  return function switchSchema(path): void {
    validate(path.accountAlerts, ({ value }) =>
      value() ? undefined : { kind: 'required', message: activationMessage() },
    );
  };
}
