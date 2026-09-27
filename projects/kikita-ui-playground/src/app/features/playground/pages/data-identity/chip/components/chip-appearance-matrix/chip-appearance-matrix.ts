import { Component } from '@angular/core';

import {
  type KuiChipAppearance,
  KuiChipDirective,
  type KuiChipSize,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Displays every documented Chip appearance and size combination. */
@Component({
  selector: 'app-chip-appearance-matrix',
  imports: [KuiChipDirective, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './chip-appearance-matrix.html',
  styleUrl: './chip-appearance-matrix.scss',
})
export class ChipAppearanceMatrix {
  protected readonly appearances = [
    { value: 'neutral', label: 'chip.appearances.neutral' },
    { value: 'primary', label: 'chip.appearances.primary' },
    { value: 'success', label: 'chip.appearances.success' },
    { value: 'warning', label: 'chip.appearances.warning' },
    { value: 'danger', label: 'chip.appearances.danger' },
    { value: 'info', label: 'chip.appearances.info' },
  ] as const satisfies readonly { value: KuiChipAppearance; label: string }[];

  protected readonly sizes = [
    { value: 'xs' },
    { value: 'sm' },
    { value: 'md' },
    { value: 'lg' },
  ] as const satisfies readonly { value: KuiChipSize }[];
}
