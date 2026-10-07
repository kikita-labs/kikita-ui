import { max, min, type SchemaPathTree } from '@angular/forms/signals';

import type { SliderFormModel } from '../interfaces';

/** Applies the documented native range bounds through Signal Forms metadata. */
export function sliderFormSchema(path: SchemaPathTree<SliderFormModel>): void {
  min(path.volume, 0);
  max(path.volume, 100);
}
