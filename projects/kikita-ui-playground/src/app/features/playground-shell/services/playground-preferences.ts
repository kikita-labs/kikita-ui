import { DOCUMENT } from '@angular/common';
import { afterNextRender, effect, inject, RendererFactory2, Service, signal } from '@angular/core';

import {
  DEFAULT_KUI_THEME_CONTRAST,
  type KuiThemeColorSeeds,
  type KuiThemeContrast,
  type KuiThemeMode,
} from '@kikita-labs/ui';

import { StorageAdapter } from '@app/core';
import {
  DEFAULT_PLAYGROUND_SEED_COLORS,
  PLAYGROUND_PREFERENCES_KEY,
} from '@features/playground-shell/constants';
import { parsePlaygroundPreferences } from '@features/playground-shell/helpers';
import type { PlaygroundPreferencesSnapshot } from '@features/playground-shell/interfaces';
import type { PlaygroundLanguage } from '@features/playground-shell/types';
import { TranslocoService } from '@jsverse/transloco';

/**
 * Holds the header and palette settings (color mode, seed colors, contrast profile, language) and
 * keeps them in `localStorage`.
 *
 * @remarks
 * The server renders the defaults, so stored values are applied after the first browser render;
 * reading them earlier would make the hydrated markup differ from the server markup. Nothing is
 * written back until the stored values have been applied, so a visit never overwrites them with
 * the defaults.
 */
@Service()
export class PlaygroundPreferences {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  private readonly storage = inject(StorageAdapter);
  private readonly transloco = inject(TranslocoService);

  /** Light or dark color mode. */
  readonly themeMode = signal<KuiThemeMode>('dark');

  /** Seed colors of the generated theme. */
  readonly seedColors = signal<KuiThemeColorSeeds>(DEFAULT_PLAYGROUND_SEED_COLORS);

  /** Chosen contrast profile. */
  readonly contrast = signal<KuiThemeContrast>(DEFAULT_KUI_THEME_CONTRAST);

  /** Interface language. */
  readonly language = signal<PlaygroundLanguage>(
    this.transloco.getActiveLang() === 'ru' ? 'ru' : 'en',
  );

  private readonly restored = signal(false);

  constructor() {
    afterNextRender(() => this.restore());

    effect(() => {
      const snapshot: PlaygroundPreferencesSnapshot = {
        themeMode: this.themeMode(),
        seedColors: this.seedColors(),
        contrast: this.contrast(),
        language: this.language(),
      };

      if (!this.restored()) return;
      this.storage.write(PLAYGROUND_PREFERENCES_KEY, JSON.stringify(snapshot));
    });
  }

  /** Switches the interface language and the document language for assistive technology. */
  setLanguage(language: PlaygroundLanguage): void {
    this.language.set(language);
    this.transloco.setActiveLang(language);
    this.renderer.setAttribute(this.document.documentElement, 'lang', language);
  }

  /** Restores every stored setting that is still valid, then starts persisting changes. */
  private restore(): void {
    const stored = parsePlaygroundPreferences(this.storage.read(PLAYGROUND_PREFERENCES_KEY));

    if (stored.themeMode) this.themeMode.set(stored.themeMode);
    if (stored.seedColors) this.seedColors.set(stored.seedColors);
    if (stored.contrast) this.contrast.set(stored.contrast);
    if (stored.language && stored.language !== this.language()) this.setLanguage(stored.language);

    this.restored.set(true);
  }
}
