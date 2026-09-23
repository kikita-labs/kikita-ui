import { Component, inject, input, output, signal } from '@angular/core';

import {
  createKuiTheme,
  DEFAULT_KUI_THEME,
  KuiButtonDirective,
  KuiColorInputDirective,
  KuiFieldComponent,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiLabelDirective,
  KuiPopoverComponent,
  KuiPopoverForDirective,
  kuiProvideFieldOptions,
  KuiTextDirective,
  type KuiThemeColorSeeds,
} from '@kikita-labs/ui';

import { DEFAULT_PLAYGROUND_SEED_COLORS } from '@features/playground-shell/constants';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-playground-palette',
  imports: [
    KuiButtonDirective,
    KuiColorInputDirective,
    KuiFieldComponent,
    KuiIconButtonDirective,
    KuiIconComponent,
    KuiLabelDirective,
    KuiPopoverComponent,
    KuiPopoverForDirective,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './playground-palette.html',
  styleUrl: './playground-palette.scss',
  providers: [kuiProvideFieldOptions({ size: 'sm' })],
})
export class PlaygroundPalette {
  readonly seedColors = input.required<KuiThemeColorSeeds>();

  readonly seedColorsChange = output<KuiThemeColorSeeds>();

  private readonly transloco = inject(TranslocoService);

  protected readonly invalidSeed = signal<string | null>(null);
  protected readonly seedNames = [
    'primary',
    'neutral',
    'success',
    'warning',
    'danger',
    'info',
  ] as const;

  /** Validates a seed with the library theme generator before emitting it to the shell. */
  protected updateSeed(color: keyof typeof DEFAULT_PLAYGROUND_SEED_COLORS, event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;

    const nextColors = { ...this.seedColors(), [color]: input.value.trim() };

    try {
      createKuiTheme({ seeds: { ...DEFAULT_KUI_THEME.seeds, color: nextColors } });
      this.seedColorsChange.emit(nextColors);
      this.invalidSeed.set(null);
      input.setCustomValidity('');
    } catch {
      this.invalidSeed.set(color);
      input.setCustomValidity(this.transloco.translate('playground.palette.invalidColor'));
    }
  }

  /** Restores the initial playground palette. */
  protected resetSeeds(): void {
    this.seedColorsChange.emit(DEFAULT_PLAYGROUND_SEED_COLORS);
    this.invalidSeed.set(null);
  }
}
