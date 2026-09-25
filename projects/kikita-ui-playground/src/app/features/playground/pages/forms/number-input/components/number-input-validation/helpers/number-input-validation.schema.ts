import { max, min, required, type SchemaPathTree } from '@angular/forms/signals';

import type { NumberInputValidationFormModel } from '../interfaces';

/** Creates localized required and range validation for the Number Input example. */
export function createNumberInputValidationSchema(
  requiredMessage: () => string,
  minimumMessage: () => string,
  maximumMessage: () => string,
): (path: SchemaPathTree<NumberInputValidationFormModel>) => void {
  return function numberInputValidationSchema(path): void {
    required(path.quantity, { message: requiredMessage });
    min(path.quantity, 1, { message: minimumMessage });
    max(path.quantity, 10, { message: maximumMessage });
  };
}
