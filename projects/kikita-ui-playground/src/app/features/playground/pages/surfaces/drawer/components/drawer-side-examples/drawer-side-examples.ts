import { Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KuiButton, kuiDrawer, KuiText } from '@kikita-labs/ui';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { createDrawerExampleData } from '../../helpers';
import type { DrawerExampleOpener, DrawerExampleResult, DrawerExampleStatusKey } from '../../types';
import { DrawerExampleActions } from '../drawer-example-actions';
import { DrawerExampleContent } from '../drawer-example-content';

/** Opens a minimally configured Drawer and compares its supported edge placements. */
@Component({
  selector: 'app-drawer-side-examples',
  imports: [DrawerExampleActions, KuiButton, KuiText, TranslocoPipe],
  templateUrl: './drawer-side-examples.html',
  styleUrl: './drawer-side-examples.scss',
})
export class DrawerSideExamples {
  private readonly destroyRef = inject(DestroyRef);

  private readonly transloco = inject(TranslocoService);

  private readonly openDefault = kuiDrawer(DrawerExampleContent);

  private readonly openLeft = kuiDrawer(DrawerExampleContent, { side: 'left' });

  private readonly openTop = kuiDrawer(DrawerExampleContent, { side: 'top' });

  private readonly openBottom = kuiDrawer(DrawerExampleContent, { side: 'bottom' });

  protected readonly result = signal<DrawerExampleStatusKey | null>(null);

  protected openDefaultDrawer(): void {
    this.show(this.openDefault, 'defaultTitle', 'defaultBody', 'defaultSubtitle');
  }

  protected openLeftDrawer(): void {
    this.show(this.openLeft, 'placementTitle', 'placementBody');
  }

  protected openTopDrawer(): void {
    this.show(this.openTop, 'placementTitle', 'placementBody');
  }

  protected openBottomDrawer(): void {
    this.show(this.openBottom, 'placementTitle', 'placementBody');
  }

  private show(
    open: DrawerExampleOpener,
    titleKey: string,
    bodyKey: string,
    subtitleKey?: string,
  ): void {
    open(
      createDrawerExampleData(this.transloco, {
        titleKey,
        bodyKey,
        subtitleKey,
      }),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.showResult(result));
  }

  private showResult(result: DrawerExampleResult | undefined): void {
    this.result.set(result ?? 'dismissed');
  }
}
