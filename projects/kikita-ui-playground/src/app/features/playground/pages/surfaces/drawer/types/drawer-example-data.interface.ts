import type { DrawerExampleResult } from './drawer-example-result.type';

/** Localized content supplied to a page-owned Drawer host. */
export interface DrawerExampleData {
  readonly title: string | null;
  readonly subtitle: string;
  readonly body: string;
  readonly bodyLines: readonly string[];
  readonly referenceLabel: string;
  readonly reference: string;
  readonly placementLabel: string;
  readonly closeButtonLabel: string;
  readonly cancelLabel: string | null;
  readonly actionLabel: string;
  readonly actionResult: DrawerExampleResult;
}
