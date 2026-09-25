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

/** Compares the independent close button, Escape, and backdrop settings. */
@Component({
  selector: 'app-drawer-dismissal-examples',
  imports: [DrawerExampleActions, KuiButtonDirective, KuiTextDirective, TranslocoPipe],
  templateUrl: './drawer-dismissal-examples.html',
  styleUrl: './drawer-dismissal-examples.scss',
})
export class DrawerDismissalExamples {
  private readonly destroyRef = inject(DestroyRef);

  private readonly transloco = inject(TranslocoService);

  private readonly openNoClose = kuiDrawer(DrawerExampleContent, { closable: false });

  private readonly openNoEscape = kuiDrawer(DrawerExampleContent, { closeOnEscape: false });

  private readonly openNoBackdrop = kuiDrawer(DrawerExampleContent, {
    closeOnBackdropClick: false,
  });

  private readonly openLocked = kuiDrawer(DrawerExampleContent, {
    closable: false,
    closeOnEscape: false,
    closeOnBackdropClick: false,
  });

  protected readonly result = signal<DrawerExampleStatusKey | null>(null);

  protected openNoCloseDrawer(): void {
    this.show(this.openNoClose, {
      titleKey: 'noCloseTitle',
      bodyKey: 'noCloseBody',
    });
  }

  protected openNoEscapeDrawer(): void {
    this.show(this.openNoEscape, {
      titleKey: 'noEscapeTitle',
      bodyKey: 'dismissalBody',
    });
  }

  protected openNoBackdropDrawer(): void {
    this.show(this.openNoBackdrop, {
      titleKey: 'noBackdropTitle',
      bodyKey: 'dismissalBody',
    });
  }

  protected openLockedDrawer(): void {
    this.show(this.openLocked, {
      titleKey: 'lockedTitle',
      bodyKey: 'lockedBody',
      showCancel: false,
      actionKey: 'continue',
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
