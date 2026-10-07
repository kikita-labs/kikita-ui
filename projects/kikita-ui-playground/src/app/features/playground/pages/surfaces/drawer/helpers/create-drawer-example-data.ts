import type { TranslocoService } from '@jsverse/transloco';

import type { DrawerExampleData, DrawerExampleOptions } from '../types';

/** Builds translated, seeded host data for one Drawer interaction. */
export function createDrawerExampleData(
  transloco: TranslocoService,
  options: DrawerExampleOptions,
): DrawerExampleData {
  const title = options.titleKey ? transloco.translate('drawer.labels.' + options.titleKey) : null;
  const subtitle = options.subtitleKey
    ? transloco.translate('drawer.labels.' + options.subtitleKey)
    : '';
  const longBody = options.longBody ?? false;

  return {
    title,
    subtitle,
    body: transloco.translate('drawer.labels.' + options.bodyKey),
    bodyLines: longBody
      ? Array.from({ length: 40 }, () => transloco.translate('drawer.labels.longBodyParagraph'))
      : [],
    referenceLabel: transloco.translate('drawer.labels.reference'),
    reference: 'TCK-1042',
    placementLabel: transloco.translate('drawer.labels.placementAndSize'),
    closeButtonLabel: transloco.translate('drawer.labels.closeButton'),
    cancelLabel: options.showCancel === false ? null : transloco.translate('drawer.actions.cancel'),
    actionLabel: transloco.translate('drawer.actions.' + (options.actionKey ?? 'save')),
    actionResult: options.actionKey === 'continue' ? 'continued' : 'saved',
  };
}
