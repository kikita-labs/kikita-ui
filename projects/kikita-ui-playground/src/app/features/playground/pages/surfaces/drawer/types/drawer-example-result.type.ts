/** Results emitted by the page-owned Drawer actions. */
export type DrawerExampleResult = 'saved' | 'cancelled' | 'continued';

/** Localized status keys reported after a Drawer closes. */
export type DrawerExampleStatusKey = DrawerExampleResult | 'dismissed';
