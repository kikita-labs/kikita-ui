import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslocoPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly transloco = inject(TranslocoService);

  /** Active shell language selected by the user. */
  protected readonly language = signal('en');

  /** Switches the runtime language without a page reload. */
  protected setLanguage(language: 'en' | 'ru'): void {
    this.language.set(language);
    this.transloco.setActiveLang(language);
  }
}
