import { required, type SchemaPathTree } from '@angular/forms/signals';

import type { FieldValidationFormModel } from '../interfaces';

/** Creates the Field schema with a reactive, localized required-error message. */
export function createFieldValidationSchema(
  requiredMessage: () => string,
): (path: SchemaPathTree<FieldValidationFormModel>) => void {
  return function fieldValidationSchema(path): void {
    required(path.email, { message: requiredMessage });
    required(path.markerOverride);
  };
}
