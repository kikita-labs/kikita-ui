import { CdkTrapFocus } from '@angular/cdk/a11y';
import type { ComponentPortal } from '@angular/cdk/portal';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import type { ComponentRef, ElementRef } from '@angular/core';
import {
  Component,
  EventEmitter,
  inject,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import { kuiIdFactory } from '../../utils/kui-id.util';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_X } from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import type { KuiDialogAppearance, KuiDialogSize } from './kui-dialog.types';

/**
 * @internal
 * CDK overlay shell for a dialog: renders the backdrop and the panel,
 * manages open/close animations, focus trap, and backdrop-click dismissal.
 * Not part of the public API.
 */
@Component({
  selector: 'kui-dialog-container',
  template: `
    <div
      class="kui-dialog-backdrop"
      [class.kui-dialog-backdrop--closing]="isClosing()"
      (pointerdown)="onBackdropPointerDown($event)"
      (click)="onBackdropClick()"
      (animationend)="onAnimationEnd($event)"
    >
      <div
        #dialogPanel
        class="kui-dialog"
        [class.kui-dialog--sm]="_size === 'sm'"
        [class.kui-dialog--md]="_size === 'md'"
        [class.kui-dialog--lg]="_size === 'lg'"
        [class.kui-dialog--auto]="_size === 'auto'"
        [class.kui-dialog--fullscreen]="_size === 'fullscreen'"
        [class.kui-dialog--closing]="isClosing()"
        [attr.data-kui-appearance]="_appearance !== 'default' ? _appearance : null"
        role="dialog"
        aria-modal="true"
        aria-label="Dialog"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        (click)="$event.stopPropagation()"
      >
        <ng-template cdkPortalOutlet />
        @if (_closable()) {
          <button type="button" class="kui-dialog-close" aria-label="Close" (click)="close()">
            <svg width="16" height="16" [kuiGlyph]="closeGlyph()" [kuiGlyphStroke]="1.5"></svg>
          </button>
        }
      </div>
    </div>
  `,
  imports: [CdkPortalOutlet, CdkTrapFocus, KuiGlyphComponent],
  encapsulation: ViewEncapsulation.None,
})
/** Renders the modal dialog surface used by the dialog service. */
export class KuiDialogContainerComponent {
  private readonly nextId = kuiIdFactory();
  private readonly dialogDefaults = inject(KuiDefaults).get('dialog');

  protected readonly closeGlyph = injectKuiGlyph({
    role: 'close',
    slot: () => this.dialogDefaults()?.closeIcon,
    fallback: KUI_GLYPH_X,
  });

  private readonly portalOutlet = viewChild.required(CdkPortalOutlet);
  private readonly dialogPanel = viewChild.required<ElementRef<HTMLElement>>('dialogPanel');

  protected readonly isClosing = signal(false);

  /** @internal Set by the service after the component is created. */
  _size: KuiDialogSize = 'md';
  /** @internal Set by the service after the component is created. */
  _appearance: KuiDialogAppearance = 'default';
  /** @internal Set by the service after the component is created. */
  _dismissable = true;
  /** @internal Set via `_closable.set()` by the service after the component is created. */
  readonly _closable = signal(true);

  private _closeResult: unknown;
  private _backdropPointerDownOnBackdrop = false;

  /** Emits the close result after the exit animation finishes. */
  readonly closed = new EventEmitter<unknown>();

  /** Attach the user-provided dialog component inside the panel. */
  attachContent<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    const ref = this.portalOutlet().attachComponentPortal(portal);
    // The component host element is a flex item of .kui-dialog.
    // display:contents removes it from layout so header/body/footer become
    // direct flex children and max-height + overflow-y:auto work correctly.
    (ref.location.nativeElement as HTMLElement).style.display = 'contents';
    // Content is rendered synchronously by this point. If the projected content
    // already brings its own `.kui-dialog-close` (older manual markup), skip the
    // auto-rendered one instead of showing two close buttons. Scoped to the
    // attached content's own root so it never matches our own button, which is
    // a sibling of the portal outlet, not a descendant of it.
    const contentRoot = ref.location.nativeElement as HTMLElement;
    if (contentRoot.querySelector('.kui-dialog-close')) {
      this._closable.set(false);
    }
    this.bindAccessibleName();
    return ref;
  }

  /** Begin the close animation; resolves after `animationend`. */
  close(result?: unknown): void {
    if (this.isClosing()) return;
    this._closeResult = result;
    this.isClosing.set(true);
  }

  protected onBackdropPointerDown(event: PointerEvent): void {
    this._backdropPointerDownOnBackdrop = event.target === event.currentTarget;
  }

  protected onBackdropClick(): void {
    const startedOnBackdrop = this._backdropPointerDownOnBackdrop;
    this._backdropPointerDownOnBackdrop = false;

    if (startedOnBackdrop && this._dismissable) this.close();
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (this.isClosing() && event.animationName === 'kui-bd-out') {
      this.closed.emit(this._closeResult);
    }
  }

  private bindAccessibleName(): void {
    const panel = this.dialogPanel().nativeElement;
    const title = panel.querySelector<HTMLElement>('.kui-dialog-title');

    if (!title) return;

    if (!title.id) {
      title.id = this.nextId('kui-dialog-title');
    }

    panel.removeAttribute('aria-label');
    panel.setAttribute('aria-labelledby', title.id);
  }
}
