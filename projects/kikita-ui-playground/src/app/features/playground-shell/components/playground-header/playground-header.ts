import { Component, inject, input, output } from '@angular/core';

import {
  KuiIcon,
  KuiIconButton,
  KuiSeparator,
  KuiText,
  type KuiThemeColorSeeds,
  type KuiThemeContrast,
  type KuiThemeMode,
} from '@kikita-labs/ui';

import { PlaygroundPalette } from '@features/playground-shell/components/playground-palette';
import { PlaygroundPreferences } from '@features/playground-shell/services';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-playground-header',
  imports: [KuiIconButton, KuiIcon, PlaygroundPalette, KuiSeparator, KuiText, TranslocoPipe],
  templateUrl: './playground-header.html',
  styleUrl: './playground-header.scss',
})
export class PlaygroundHeader {
  readonly themeMode = input<KuiThemeMode>('dark');
  readonly seedColors = input.required<KuiThemeColorSeeds>();
  readonly contrast = input.required<KuiThemeContrast>();

  readonly themeModeChange = output<KuiThemeMode>();
  readonly seedColorsChange = output<KuiThemeColorSeeds>();
  readonly contrastChange = output<KuiThemeContrast>();

  private readonly preferences = inject(PlaygroundPreferences);

  protected readonly language = this.preferences.language;

  /** Switches between the two supported playground locales. */
  protected toggleLanguage(): void {
    this.preferences.setLanguage(this.language() === 'en' ? 'ru' : 'en');
  }

  /** Emits the next supported Kikita UI color mode. */
  protected toggleTheme(): void {
    this.themeModeChange.emit(this.themeMode() === 'dark' ? 'light' : 'dark');
  }
}
