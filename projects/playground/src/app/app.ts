import { DOCUMENT } from '@angular/common';
import { Component, ViewEncapsulation, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { KuiThemeMode } from '@kikita-labs/ui';

interface NavItem {
  readonly path: string;
  readonly label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { path: '/tokens', label: 'Tokens' },
  { path: '/theme', label: 'Theme' },
  { path: '/density', label: 'Density' },
  { path: '/button', label: 'Button' },
  { path: '/field', label: 'Field' },
  { path: '/input', label: 'Input' },
  { path: '/textarea', label: 'Textarea' },
  { path: '/checkbox', label: 'Checkbox' },
  { path: '/switch', label: 'Switch' },
  { path: '/radio', label: 'Radio' },
  { path: '/badge', label: 'Badge' },
  { path: '/loader', label: 'Loader' },
  { path: '/card', label: 'Card' },
  { path: '/group', label: 'Group' },
  { path: '/icons', label: 'Icons' },
  { path: '/forms', label: 'Forms' },
  { path: '/tooltip', label: 'Tooltip' },
];

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App {
  private readonly document = inject(DOCUMENT);
  protected readonly mode = signal<KuiThemeMode>('dark');
  protected readonly modes: readonly KuiThemeMode[] = ['light', 'dark'];
  protected readonly navItems = NAV_ITEMS;

  constructor() {
    effect(() => {
      this.document.documentElement.dataset['kuiTheme'] = this.mode();
    });
  }

  protected setMode(mode: KuiThemeMode): void {
    this.mode.set(mode);
  }
}
