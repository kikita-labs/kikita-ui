import { type SchemaPathTree, validate } from '@angular/forms/signals';

import type { SegmentedFormModel } from '../interfaces';

export function createSegmentedFormSchema(
  invalidMessage: () => string,
): (path: SchemaPathTree<SegmentedFormModel>) => void {
  return function segmentedFormSchema(path): void {
    validate(path.view, ({ value }) =>
      value() === 'grid' ? { kind: 'preferredView', message: invalidMessage() } : undefined,
    );
  };
}
