import type { KuiButtonAppearance, KuiButtonShape } from '@kikita-labs/ui';

export const ICON_BUTTON_APPEARANCES = [
  { value: null, id: 'default', labelKey: 'iconButton.appearances.default' },
  { value: 'primary', id: 'primary', labelKey: 'iconButton.appearances.primary' },
  { value: 'success', id: 'success', labelKey: 'iconButton.appearances.success' },
  { value: 'warning', id: 'warning', labelKey: 'iconButton.appearances.warning' },
  { value: 'danger', id: 'danger', labelKey: 'iconButton.appearances.danger' },
] as const satisfies readonly {
  value: KuiButtonAppearance | null;
  id: string;
  labelKey: string;
}[];

export const ICON_BUTTON_SHAPES = [
  { value: 'solid', labelKey: 'iconButton.shapes.solid' },
  { value: 'soft', labelKey: 'iconButton.shapes.soft' },
  { value: 'outline', labelKey: 'iconButton.shapes.outline' },
  { value: 'ghost', labelKey: 'iconButton.shapes.ghost' },
] as const satisfies readonly { value: KuiButtonShape; labelKey: string }[];

export const ICON_BUTTON_SIZES = [
  { value: 'xs', labelKey: 'iconButton.sizes.xs' },
  { value: 'sm', labelKey: 'iconButton.sizes.sm' },
  { value: 'md', labelKey: 'iconButton.sizes.md' },
  { value: 'lg', labelKey: 'iconButton.sizes.lg' },
] as const;
