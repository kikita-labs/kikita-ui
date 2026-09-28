import { required, type SchemaPathTree } from '@angular/forms/signals';

import type { ComboboxSignalFormsModel } from '../interfaces';

/** Creates the Combobox Signal Forms schema with a localized required-error message. */
export function createComboboxSignalFormsSchema(
  requiredMessage: () => string,
): (path: SchemaPathTree<ComboboxSignalFormsModel>) => void {
  return function comboboxSignalFormsSchema(path): void {
    required(path.assignee, { message: requiredMessage });
  };
}
