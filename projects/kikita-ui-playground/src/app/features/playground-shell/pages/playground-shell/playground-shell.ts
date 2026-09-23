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
  signal,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import {
  createKuiTheme,
  createKuiThemeStyleSheet,
  DEFAULT_KUI_THEME,
  type KuiThemeColorSeeds,
  type KuiThemeMode,
} from '@kikita-labs/ui';

import { ComponentSidebar, PlaygroundHeader } from '@features/playground-shell/components';
import { DEFAULT_PLAYGROUND_SEED_COLORS } from '@features/playground-shell/constants';

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

  protected readonly themeMode = signal<KuiThemeMode>('dark');
  protected readonly seedColors = signal<KuiThemeColorSeeds>(DEFAULT_PLAYGROUND_SEED_COLORS);

  protected readonly selectedComponentId = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => {
        const activeRoute = this.route.firstChild?.snapshot;

        return activeRoute?.paramMap.get('componentId') ?? activeRoute?.data['componentId'] ?? null;
      }),
    ),
    {
      initialValue:
        this.route.firstChild?.snapshot?.paramMap.get('componentId') ??
        this.route.firstChild?.snapshot?.data['componentId'] ??
        null,
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
    this.renderer.setAttribute(this.document.documentElement, 'data-kui-theme', this.themeMode());

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
    this.renderer.setAttribute(this.document.documentElement, 'data-kui-theme', mode);
  }

  /** Applies validated seed values from the app header. */
  protected setSeedColors(colors: KuiThemeColorSeeds): void {
    this.seedColors.set(colors);
  }
}
