/** Options for creating deterministic, localized Drawer host data. */
export interface DrawerExampleOptions {
  readonly titleKey?: string | null;
  readonly subtitleKey?: string | null;
  readonly bodyKey: string;
  readonly longBody?: boolean;
  readonly showCancel?: boolean;
  readonly actionKey?: string;
}
