import type { KuiButtonAppearance, KuiButtonShape } from '@kikita-labs/ui';

export const BUTTON_APPEARANCES = [
  { value: null, id: 'default', labelKey: 'button.appearances.default' },
  { value: 'primary', id: 'primary', labelKey: 'button.appearances.primary' },
  { value: 'success', id: 'success', labelKey: 'button.appearances.success' },
  { value: 'warning', id: 'warning', labelKey: 'button.appearances.warning' },
  { value: 'danger', id: 'danger', labelKey: 'button.appearances.danger' },
] as const satisfies readonly {
  value: KuiButtonAppearance | null;
  id: string;
  labelKey: string;
}[];

export const BUTTON_SHAPES = [
  { value: 'solid', labelKey: 'button.shapes.solid' },
  { value: 'soft', labelKey: 'button.shapes.soft' },
  { value: 'outline', labelKey: 'button.shapes.outline' },
  { value: 'ghost', labelKey: 'button.shapes.ghost' },
] as const satisfies readonly { value: KuiButtonShape; labelKey: string }[];

export const BUTTON_SIZES = [
  { value: 'xs', labelKey: 'button.sizes.xs' },
  { value: 'sm', labelKey: 'button.sizes.sm' },
  { value: 'md', labelKey: 'button.sizes.md' },
  { value: 'lg', labelKey: 'button.sizes.lg' },
] as const;
