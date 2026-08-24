import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal, ViewEncapsulation } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
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
  { path: '/calendar-range', label: 'Calendar Range' },
  { path: '/date-picker', label: 'Date Picker' },
  { path: '/tree', label: 'Tree' },
  { path: '/file-upload', label: 'File Upload' },
];

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    FormField,
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

  /**
   * Single source of truth for both header segmented controls below -- one wired the legacy way
   * ([selected] + (selectedChange)), the other via Signal Forms ([formField]) -- so toggling either
   * one moves both, proving the two binding styles stay in sync on the same state.
   */
  protected readonly themeModel = signal<{ mode: KuiThemeMode }>({ mode: 'dark' });
  protected readonly themeForm = form(this.themeModel);
  protected readonly mode = computed(() => this.themeModel().mode);
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
    this.themeModel.set({ mode });
  }
}
