import { required, type SchemaPathTree } from '@angular/forms/signals';

import type { DatePickerFormModel } from '../interfaces';

/** Requires a delivery date and provides the field's accessible validation message. */
export function datePickerFormSchema(path: SchemaPathTree<DatePickerFormModel>): void {
  required(path.deliveryDate);
}
