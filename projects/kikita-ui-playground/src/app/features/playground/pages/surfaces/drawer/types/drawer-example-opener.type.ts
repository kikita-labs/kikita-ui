import type { Observable } from 'rxjs';

import type { DrawerExampleData } from './drawer-example-data.interface';
import type { DrawerExampleResult } from './drawer-example-result.type';

/** Typed opener returned by the public kuiDrawer factory for this page's host. */
export type DrawerExampleOpener = (
  data: DrawerExampleData,
) => Observable<DrawerExampleResult | undefined>;
