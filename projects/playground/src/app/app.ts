import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

import {
  KuiButtonDirective,
  KuiCardDirective,
  KuiSegmentDirective,
  KuiSegmentedComponent,
} from '@kikita-labs/ui';

import type { KuiThemeMode } from '@kikita-labs/ui';

interface NavItem {
  readonly path: string;
  readonly label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { path: '/tokens', label: 'Tokens' },
  { path: '/typography', label: 'Typography' },
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
  { path: '/avatar', label: 'Avatar' },
  { path: '/loader', label: 'Loader' },
  { path: '/skeleton', label: 'Skeleton' },
  { path: '/empty-state', label: 'Empty State' },
  { path: '/card', label: 'Card' },
  { path: '/group', label: 'Group' },
  { path: '/icons', label: 'Icons' },
  { path: '/forms', label: 'Forms' },
  { path: '/tabs', label: 'Tabs' },
  { path: '/tooltip', label: 'Tooltip' },
  { path: '/segmented', label: 'Segmented' },
  { path: '/table', label: 'Table' },
  { path: '/select', label: 'Select' },
  { path: '/dropdown', label: 'Dropdown' },
  { path: '/dialog', label: 'Dialog' },
  { path: '/toast', label: 'Toast' },
  { path: '/popover', label: 'Popover' },
  { path: '/accordion', label: 'Accordion' },
  { path: '/progress', label: 'Progress' },
  { path: '/slider', label: 'Slider' },
  { path: '/number-input', label: 'Number Input' },
  { path: '/menu', label: 'Menu' },
  { path: '/separator', label: 'Separator' },
  { path: '/drawer', label: 'Drawer' },
  { path: '/chip', label: 'Chip' },
  { path: '/combobox', label: 'Combobox' },
  { path: '/command-palette', label: 'Command Palette' },
  { path: '/scrollbar', label: 'Scrollbar' },
  { path: '/color-input', label: 'Color Input' },
  { path: '/stepper', label: 'Stepper' },
  { path: '/breadcrumbs', label: 'Breadcrumbs' },
  { path: '/calendar', label: 'Calendar' },
  { path: '/date-picker', label: 'Date Picker' },
  { path: '/tree', label: 'Tree' },
  { path: '/file-upload', label: 'File Upload' },
];

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    KuiButtonDirective,
    KuiCardDirective,
    KuiSegmentedComponent,
    KuiSegmentDirective,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  protected readonly mode = signal<KuiThemeMode>('dark');
  protected readonly navItems = NAV_ITEMS;
  protected readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    effect(() => {
      this.document.documentElement.setAttribute('data-kui-theme', this.mode());
    });
  }

  protected setMode(mode: KuiThemeMode): void {
    this.mode.set(mode);
  }
}
