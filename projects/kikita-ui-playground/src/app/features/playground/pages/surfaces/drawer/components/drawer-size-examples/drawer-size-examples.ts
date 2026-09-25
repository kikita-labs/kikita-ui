import { Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KuiButtonDirective, kuiDrawer, KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { createDrawerExampleData } from '../../helpers';
import type { DrawerExampleOpener, DrawerExampleResult, DrawerExampleStatusKey } from '../../types';
import { DrawerExampleActions } from '../drawer-example-actions';
import { DrawerExampleContent } from '../drawer-example-content';

/** Opens every supported horizontal and vertical Drawer size preset. */
@Component({
  selector: 'app-drawer-size-examples',
  imports: [DrawerExampleActions, KuiButtonDirective, KuiTextDirective, TranslocoPipe],
  templateUrl: './drawer-size-examples.html',
})
export class DrawerSizeExamples {
  private readonly destroyRef = inject(DestroyRef);

  private readonly transloco = inject(TranslocoService);

  private readonly openRightSm = kuiDrawer(DrawerExampleContent, { side: 'right', size: 'sm' });

  private readonly openRightMd = kuiDrawer(DrawerExampleContent, { side: 'right', size: 'md' });

  private readonly openRightLg = kuiDrawer(DrawerExampleContent, { side: 'right', size: 'lg' });

  private readonly openRightFull = kuiDrawer(DrawerExampleContent, {
    side: 'right',
    size: 'full',
  });

  private readonly openRightAuto = kuiDrawer(DrawerExampleContent, {
    side: 'right',
    size: 'auto',
  });

  private readonly openBottomSm = kuiDrawer(DrawerExampleContent, { side: 'bottom', size: 'sm' });

  private readonly openBottomMd = kuiDrawer(DrawerExampleContent, { side: 'bottom', size: 'md' });

  private readonly openBottomLg = kuiDrawer(DrawerExampleContent, { side: 'bottom', size: 'lg' });

  private readonly openBottomFull = kuiDrawer(DrawerExampleContent, {
    side: 'bottom',
    size: 'full',
  });

  private readonly openBottomAuto = kuiDrawer(DrawerExampleContent, {
    side: 'bottom',
    size: 'auto',
  });

  protected readonly result = signal<DrawerExampleStatusKey | null>(null);

  protected openRightSmDrawer(): void {
    this.show(this.openRightSm);
  }

  protected openRightMdDrawer(): void {
    this.show(this.openRightMd);
  }

  protected openRightLgDrawer(): void {
    this.show(this.openRightLg);
  }

  protected openRightFullDrawer(): void {
    this.show(this.openRightFull);
  }

  protected openRightAutoDrawer(): void {
    this.show(this.openRightAuto);
  }

  protected openBottomSmDrawer(): void {
    this.show(this.openBottomSm);
  }

  protected openBottomMdDrawer(): void {
    this.show(this.openBottomMd);
  }

  protected openBottomLgDrawer(): void {
    this.show(this.openBottomLg);
  }

  protected openBottomFullDrawer(): void {
    this.show(this.openBottomFull);
  }

  protected openBottomAutoDrawer(): void {
    this.show(this.openBottomAuto);
  }

  private show(open: DrawerExampleOpener): void {
    open(
      createDrawerExampleData(this.transloco, {
        titleKey: 'sizeTitle',
        bodyKey: 'sizeBody',
      }),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.showResult(result));
  }

  private showResult(result: DrawerExampleResult | undefined): void {
    this.result.set(result ?? 'dismissed');
  }
}
