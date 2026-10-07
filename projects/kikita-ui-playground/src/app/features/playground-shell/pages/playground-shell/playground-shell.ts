import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import type { ActivatedRouteSnapshot } from '@angular/router';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import {
  createKuiTheme,
  createKuiThemeStyleSheet,
  DEFAULT_KUI_THEME,
  type KuiThemeColorSeeds,
  type KuiThemeContrast,
  type KuiThemeMode,
} from '@kikita-labs/ui';

import { ComponentSidebar, PlaygroundHeader } from '@features/playground-shell/components';
import { PlaygroundPreferences } from '@features/playground-shell/services';

@Component({
  selector: 'app-playground-shell',
  imports: [ComponentSidebar, PlaygroundHeader, RouterOutlet],
  templateUrl: './playground-shell.html',
  styleUrl: './playground-shell.scss',
})
export class PlaygroundShell {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly preferences = inject(PlaygroundPreferences);

  protected readonly themeMode = this.preferences.themeMode;
  protected readonly seedColors = this.preferences.seedColors;
  protected readonly contrast = this.preferences.contrast;

  protected readonly selectedComponentId = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.getSelectedComponentId()),
    ),
    {
      initialValue: this.getSelectedComponentId(),
    },
  );

  protected readonly themeStylesheet = computed(() =>
    createKuiThemeStyleSheet(
      createKuiTheme({
        seeds: {
          ...DEFAULT_KUI_THEME.seeds,
          color: this.seedColors(),
        },
      }),
    ),
  );

  constructor() {
    // The attributes follow the preferences, which are restored from storage after the first render.
    effect(() => {
      const root = this.document.documentElement;

      this.renderer.setAttribute(root, 'data-kui-theme', this.themeMode());
      this.renderer.setAttribute(root, 'data-kui-contrast', this.contrast());
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const themeStyle = this.renderer.createElement('style') as HTMLStyleElement;
      this.renderer.setAttribute(themeStyle, 'id', 'playground-theme');
      this.renderer.setProperty(themeStyle, 'textContent', this.themeStylesheet());
      this.renderer.appendChild(this.document.head, themeStyle);

      effect(() => this.renderer.setProperty(themeStyle, 'textContent', this.themeStylesheet()), {
        injector: this.injector,
      });

      this.destroyRef.onDestroy(() => {
        this.renderer.removeChild(this.document.head, themeStyle);
      });
    });
  }

  /** Applies a theme mode chosen from the app header. */
  protected setThemeMode(mode: KuiThemeMode): void {
    this.themeMode.set(mode);
  }

  /** Applies validated seed values from the app header. */
  protected setSeedColors(colors: KuiThemeColorSeeds): void {
    this.seedColors.set(colors);
  }

  /** Applies the contrast mode chosen from the app header. */
  protected setContrast(contrast: KuiThemeContrast): void {
    this.contrast.set(contrast);
  }

  private getSelectedComponentId(): string | null {
    let activeRoute: ActivatedRouteSnapshot = this.route.snapshot;

    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }

    return activeRoute.paramMap.get('componentId') ?? activeRoute.data['componentId'] ?? null;
  }
}
