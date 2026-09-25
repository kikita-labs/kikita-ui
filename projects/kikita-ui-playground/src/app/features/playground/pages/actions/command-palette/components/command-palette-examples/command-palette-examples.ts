import { Component, computed, inject, signal } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import {
  KuiButtonDirective,
  type KuiCommandItem,
  KuiCommandPaletteComponent,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { COMMAND_PALETTE_TRANSLATION_KEYS } from './constants';
import { createCommandGroups } from './helpers';

@Component({
  selector: 'app-command-palette-examples',
  imports: [
    KuiButtonDirective,
    KuiCommandPaletteComponent,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './command-palette-examples.html',
  styleUrl: './command-palette-examples.scss',
})
export class CommandPaletteExamples {
  private readonly transloco = inject(TranslocoService);

  private readonly translatedMessages = toSignal<string[] | null>(
    this.transloco.selectTranslate<string[]>(
      [...COMMAND_PALETTE_TRANSLATION_KEYS],
      {},
      { scope: 'command-palette' },
    ),
    { initialValue: null },
  );

  protected readonly groups = computed(() => {
    const messages = this.translatedMessages();
    if (!messages) return [];

    return createCommandGroups((key) => {
      const index = COMMAND_PALETTE_TRANSLATION_KEYS.findIndex(
        (translationKey) => translationKey === key,
      );

      return messages[index] ?? key;
    });
  });

  protected readonly defaultOpen = signal(false);
  protected readonly filteredOpen = signal(false);
  protected readonly loadingOpen = signal(false);
  protected readonly emptyOpen = signal(false);
  protected readonly filteredQuery = signal('');
  protected readonly emptyQuery = signal('');
  protected readonly selectedCommand = signal<string | null>(null);

  /** Opens the standard grouped palette example. */
  protected openDefaultPalette(): void {
    this.defaultOpen.set(true);
  }

  /** Opens the palette with a localized search term already applied. */
  protected openFilteredPalette(): void {
    this.filteredQuery.set(this.getTranslatedMessage('scenarios.projectQuery'));
    this.filteredOpen.set(true);
  }

  /** Opens the palette in its loading state. */
  protected openLoadingPalette(): void {
    this.loadingOpen.set(true);
  }

  /** Opens the palette with no matching commands. */
  protected openEmptyPalette(): void {
    this.emptyQuery.set(this.getTranslatedMessage('scenarios.emptyQuery'));
    this.emptyOpen.set(true);
  }

  /** Stores the label emitted by the selected command. */
  protected selectCommand(item: KuiCommandItem): void {
    this.selectedCommand.set(item.label);
  }

  private getTranslatedMessage(key: string): string {
    const index = COMMAND_PALETTE_TRANSLATION_KEYS.findIndex(
      (translationKey) => translationKey === key,
    );

    return this.translatedMessages()?.[index] ?? key;
  }
}
