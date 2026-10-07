import { required, type SchemaPathTree } from '@angular/forms/signals';

import type { InputValidationFormModel } from '../interfaces';

/** Creates the Input Signal Forms schema with a reactive, localized required-error message. */
export function createInputValidationSchema(
  requiredMessage: () => string,
): (path: SchemaPathTree<InputValidationFormModel>) => void {
  return function inputValidationSchema(path): void {
    required(path.email, { message: requiredMessage });
  };
}
