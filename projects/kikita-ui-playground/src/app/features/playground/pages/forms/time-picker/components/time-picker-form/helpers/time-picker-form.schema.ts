import { required, type SchemaPathTree } from '@angular/forms/signals';

import type { TimePickerFormModel } from '../interfaces';

/** Requires a delivery time. */
export function timePickerFormSchema(path: SchemaPathTree<TimePickerFormModel>): void {
  required(path.deliveryTime);
}
