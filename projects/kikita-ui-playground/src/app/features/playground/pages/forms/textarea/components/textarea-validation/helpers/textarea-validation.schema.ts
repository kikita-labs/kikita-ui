import { required, type SchemaPathTree } from '@angular/forms/signals';

import type { TextareaValidationFormModel } from '../interfaces';

/** Creates the Textarea Signal Forms schema with a reactive, localized required-error message. */
export function createTextareaValidationSchema(
  requiredMessage: () => string,
): (path: SchemaPathTree<TextareaValidationFormModel>) => void {
  return function textareaValidationSchema(path): void {
    required(path.description, { message: requiredMessage });
  };
}
