import { Component, inject, input, output, signal } from '@angular/core';

import {
  DEFAULT_KUI_THEME_CONTRAST,
  KuiButton,
  KuiColorInput,
  KuiField,
  KuiIcon,
  KuiIconButton,
  KuiLabel,
  KuiPopover,
  KuiPopoverFor,
  kuiProvideFieldOptions,
  KuiSegment,
  KuiSegmented,
  KuiText,
  type KuiThemeColorSeeds,
  type KuiThemeContrast,
} from '@kikita-labs/ui';

import {
  DEFAULT_PLAYGROUND_SEED_COLORS,
  PLAYGROUND_SEED_NAMES,
  type PlaygroundSeedName,
} from '@features/playground-shell/constants';
import { isValidSeedColors } from '@features/playground-shell/helpers';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-playground-palette',
  imports: [
    KuiButton,
    KuiColorInput,
    KuiField,
    KuiIconButton,
    KuiIcon,
    KuiLabel,
    KuiPopover,
    KuiPopoverFor,
    KuiSegment,
    KuiSegmented,
    KuiText,
    TranslocoPipe,
  ],
  templateUrl: './playground-palette.html',
  styleUrl: './playground-palette.scss',
  providers: [kuiProvideFieldOptions({ size: 'sm' })],
})
export class PlaygroundPalette {
  readonly seedColors = input.required<KuiThemeColorSeeds>();
  readonly contrast = input.required<KuiThemeContrast>();

  readonly seedColorsChange = output<KuiThemeColorSeeds>();
  readonly contrastChange = output<KuiThemeContrast>();

  private readonly transloco = inject(TranslocoService);

  protected readonly invalidSeed = signal<string | null>(null);
  protected readonly seedNames = PLAYGROUND_SEED_NAMES;

  /** Validates a seed with the library theme generator before emitting it to the shell. */
  protected updateSeed(color: PlaygroundSeedName, event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;

    const nextColors = { ...this.seedColors(), [color]: input.value.trim() };

    if (isValidSeedColors(nextColors)) {
      this.seedColorsChange.emit(nextColors);
      this.invalidSeed.set(null);
      input.setCustomValidity('');
    } else {
      this.invalidSeed.set(color);
      input.setCustomValidity(this.transloco.translate('playground.palette.invalidColor'));
    }
  }

  /** Emits the contrast mode picked in the segmented control. */
  protected setContrast(value: string): void {
    if (value === 'strict' || value === 'soft') this.contrastChange.emit(value);
  }

  /** Restores the initial playground palette and contrast mode. */
  protected resetSeeds(): void {
    this.seedColorsChange.emit(DEFAULT_PLAYGROUND_SEED_COLORS);
    this.contrastChange.emit(DEFAULT_KUI_THEME_CONTRAST);
    this.invalidSeed.set(null);
  }
}
