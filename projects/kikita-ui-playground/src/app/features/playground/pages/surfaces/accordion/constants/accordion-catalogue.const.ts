import type { KuiAccordionAppearance, KuiSize } from '@kikita-labs/ui';

/** Supported Accordion appearances shown in the visual catalogue. */
export const ACCORDION_APPEARANCES = [
  { key: 'default', value: 'default' },
  { key: 'bordered', value: 'bordered' },
  { key: 'ghost', value: 'ghost' },
] as const satisfies readonly { key: KuiAccordionAppearance; value: KuiAccordionAppearance }[];

/** Shared Kikita UI sizes shown in the visual catalogue. */
export const ACCORDION_SIZES = [
  { key: 'extraSmall', value: 'xs' },
  { key: 'small', value: 'sm' },
  { key: 'medium', value: 'md' },
  { key: 'large', value: 'lg' },
] as const satisfies readonly { key: string; value: KuiSize }[];
