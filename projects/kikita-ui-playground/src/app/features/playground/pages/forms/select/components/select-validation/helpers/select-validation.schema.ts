import { required, type SchemaPathTree } from '@angular/forms/signals';

import type { SelectValidationModel } from '../interfaces';

/** Creates the Select Signal Forms schema with a localized required-error message. */
export function createSelectValidationSchema(
  requiredMessage: () => string,
): (path: SchemaPathTree<SelectValidationModel>) => void {
  return function selectValidationSchema(path): void {
    required(path.role, { message: requiredMessage });
  };
}
