import { Component, signal } from '@angular/core';

import {
  KuiButtonDirective,
  type KuiChipAppearance,
  KuiChipDirective,
  KuiChipRemoveDirective,
  KuiIconButtonDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows default and custom remove controls with consumer-owned removal state. */
@Component({
  selector: 'app-chip-removal-examples',
  imports: [
    KuiButtonDirective,
    KuiChipDirective,
    KuiChipRemoveDirective,
    KuiIconButtonDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './chip-removal-examples.html',
  styleUrl: './chip-removal-examples.scss',
})
export class ChipRemovalExamples {
  private readonly initialRemovableTags = [
    {
      id: 'angular',
      label: 'chip.labels.angular',
      removeLabel: 'chip.accessibility.removeAngular',
    },
    {
      id: 'design',
      label: 'chip.labels.design',
      removeLabel: 'chip.accessibility.removeDesign',
    },
    {
      id: 'backend',
      label: 'chip.labels.backend',
      removeLabel: 'chip.accessibility.removeBackend',
    },
  ];

  private readonly initialCustomRemovers = [
    {
      id: 'custom-plain',
      label: 'chip.labels.customPlain',
      removeLabel: 'chip.accessibility.removeCustomPlain',
      appearance: 'neutral',
      iconButton: false,
    },
    {
      id: 'custom-icon-button',
      label: 'chip.labels.customIconButton',
      removeLabel: 'chip.accessibility.removeCustomIconButton',
      appearance: 'primary',
      iconButton: true,
    },
  ] satisfies readonly {
    id: string;
    label: string;
    removeLabel: string;
    appearance: KuiChipAppearance;
    iconButton: boolean;
  }[];

  protected readonly removableTags = signal(this.initialRemovableTags);

  protected readonly customRemovers = signal(this.initialCustomRemovers);

  protected readonly removalCount = signal(0);

  protected removeTag(id: string): void {
    this.removableTags.update((tags) => tags.filter((tag) => tag.id !== id));
    this.removalCount.update((count) => count + 1);
  }

  protected removeCustomTag(id: string): void {
    this.customRemovers.update((tags) => tags.filter((tag) => tag.id !== id));
    this.removalCount.update((count) => count + 1);
  }

  protected resetRemovalExamples(): void {
    this.removableTags.set(this.initialRemovableTags);
    this.customRemovers.set(this.initialCustomRemovers);
    this.removalCount.set(0);
  }
}
