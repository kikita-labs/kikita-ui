import { Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KuiButtonDirective, kuiDrawer, KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { createDrawerExampleData } from '../../helpers';
import type {
  DrawerExampleOpener,
  DrawerExampleOptions,
  DrawerExampleResult,
  DrawerExampleStatusKey,
} from '../../types';
import { DrawerExampleActions } from '../drawer-example-actions';
import { DrawerExampleContent } from '../drawer-example-content';

/** Opens titled, untitled, and internally scrollable Drawer content. */
@Component({
  selector: 'app-drawer-content-examples',
  imports: [DrawerExampleActions, KuiButtonDirective, KuiTextDirective, TranslocoPipe],
  templateUrl: './drawer-content-examples.html',
  styleUrl: './drawer-content-examples.scss',
})
export class DrawerContentExamples {
  private readonly destroyRef = inject(DestroyRef);

  private readonly transloco = inject(TranslocoService);

  private readonly openLongTitle = kuiDrawer(DrawerExampleContent, { size: 'sm' });

  private readonly openUntitled = kuiDrawer(DrawerExampleContent);

  private readonly openLongBody = kuiDrawer(DrawerExampleContent);

  protected readonly result = signal<DrawerExampleStatusKey | null>(null);

  protected openLongTitleDrawer(): void {
    this.show(this.openLongTitle, {
      titleKey: 'longTitle',
      bodyKey: 'longTitleBody',
    });
  }

  protected openUntitledDrawer(): void {
    this.show(this.openUntitled, {
      titleKey: null,
      bodyKey: 'untitledBody',
    });
  }

  protected openLongBodyDrawer(): void {
    this.show(this.openLongBody, {
      titleKey: 'longBodyTitle',
      bodyKey: 'longBodyIntro',
      longBody: true,
    });
  }

  private show(open: DrawerExampleOpener, options: DrawerExampleOptions): void {
    open(createDrawerExampleData(this.transloco, options))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.showResult(result));
  }

  private showResult(result: DrawerExampleResult | undefined): void {
    this.result.set(result ?? 'dismissed');
  }
}
