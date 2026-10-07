import { Component, signal } from '@angular/core';

import { KuiAvatar, KuiChip, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { ChipAppearanceMatrix } from './components/chip-appearance-matrix';
import { ChipRemovalExamples } from './components/chip-removal-examples';

/** Shows Chip's supported appearances, sizes, remove actions, and native hosts. */
@Component({
  selector: 'app-chip',
  imports: [
    ChipAppearanceMatrix,
    ChipRemovalExamples,
    KuiAvatar,
    KuiChip,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
})
export class Chip {
  protected readonly activationCount = signal(0);

  protected activateAction(): void {
    this.activationCount.update((count) => count + 1);
  }
}
