import type { KuiPopoverAlign, KuiPopoverPlacement } from '@kikita-labs/ui';

export const POPOVER_POSITIONS = [
  { key: 'topStart', placement: 'top', align: 'start' },
  { key: 'topCenter', placement: 'top', align: 'center' },
  { key: 'topEnd', placement: 'top', align: 'end' },
  { key: 'bottomStart', placement: 'bottom', align: 'start' },
  { key: 'bottomCenter', placement: 'bottom', align: 'center' },
  { key: 'bottomEnd', placement: 'bottom', align: 'end' },
  { key: 'leftStart', placement: 'left', align: 'start' },
  { key: 'leftCenter', placement: 'left', align: 'center' },
  { key: 'leftEnd', placement: 'left', align: 'end' },
  { key: 'rightStart', placement: 'right', align: 'start' },
  { key: 'rightCenter', placement: 'right', align: 'center' },
  { key: 'rightEnd', placement: 'right', align: 'end' },
] as const satisfies readonly {
  key: string;
  placement: KuiPopoverPlacement;
  align: KuiPopoverAlign;
}[];
