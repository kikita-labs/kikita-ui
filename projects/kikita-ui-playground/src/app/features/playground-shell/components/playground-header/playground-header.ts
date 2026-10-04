import { DOCUMENT } from '@angular/common';
import { Component, inject, input, output, Renderer2, signal } from '@angular/core';

import {
  KuiIcon,
  KuiIconButton,
  KuiSeparator,
  KuiText,
  type KuiThemeColorSeeds,
  type KuiThemeMode,
} from '@kikita-labs/ui';

import { PlaygroundPalette } from '@features/playground-shell/components/playground-palette';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-playground-header',
  imports: [KuiIconButton, KuiIcon, PlaygroundPalette, KuiSeparator, KuiText, TranslocoPipe],
  templateUrl: './playground-header.html',
  styleUrl: './playground-header.scss',
})
export class PlaygroundHeader {
  readonly themeMode = input<KuiThemeMode>('dark');
  readonly seedColors = input.required<KuiThemeColorSeeds>();

  readonly themeModeChange = output<KuiThemeMode>();
  readonly seedColorsChange = output<KuiThemeColorSeeds>();

  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly transloco = inject(TranslocoService);

  protected readonly language = signal<'en' | 'ru'>(
    this.transloco.getActiveLang() === 'ru' ? 'ru' : 'en',
  );

  /** Changes the runtime locale and the document's language for assistive technology. */
  protected setLanguage(language: string): void {
    if (language !== 'en' && language !== 'ru') return;

    this.language.set(language);
    this.transloco.setActiveLang(language);
    this.renderer.setAttribute(this.document.documentElement, 'lang', language);
  }

  /** Switches between the two supported playground locales. */
  protected toggleLanguage(): void {
    this.setLanguage(this.language() === 'en' ? 'ru' : 'en');
  }

  /** Emits the next supported Kikita UI color mode. */
  protected toggleTheme(): void {
    this.themeModeChange.emit(this.themeMode() === 'dark' ? 'light' : 'dark');
  }
}
