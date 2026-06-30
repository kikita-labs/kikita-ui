import {
  Component,
  ComponentRef,
  ElementRef,
  EventEmitter,
  signal,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import type { KuiDialogAppearance, KuiDialogSize } from './kui-dialog.types';

let nextDialogTitleId = 0;

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
      </div>
    </div>
  `,
  imports: [CdkPortalOutlet, CdkTrapFocus],
  encapsulation: ViewEncapsulation.None,
})
export class KuiDialogContainerComponent {
  private readonly portalOutlet = viewChild.required(CdkPortalOutlet);
  private readonly dialogPanel = viewChild.required<ElementRef<HTMLElement>>('dialogPanel');

  protected readonly isClosing = signal(false);

  /** @internal Set by the service after the component is created. */
  _size: KuiDialogSize = 'md';
  /** @internal Set by the service after the component is created. */
  _appearance: KuiDialogAppearance = 'default';
  /** @internal Set by the service after the component is created. */
  _dismissable = true;

  private _closeResult: unknown;

  /** Emits the close result after the exit animation finishes. */
  readonly closed = new EventEmitter<unknown>();

  /** Attach the user-provided dialog component inside the panel. */
  attachContent<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    const ref = this.portalOutlet().attachComponentPortal(portal);
    // The component host element is a flex item of .kui-dialog.
    // display:contents removes it from layout so header/body/footer become
    // direct flex children and max-height + overflow-y:auto work correctly.
    (ref.location.nativeElement as HTMLElement).style.display = 'contents';
    this.bindAccessibleName();
    return ref;
  }

  /** Begin the close animation; resolves after `animationend`. */
  close(result?: unknown): void {
    if (this.isClosing()) return;
    this._closeResult = result;
    this.isClosing.set(true);
  }

  protected onBackdropClick(): void {
    if (this._dismissable) this.close();
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
      title.id = `kui-dialog-title-${nextDialogTitleId++}`;
    }

    panel.removeAttribute('aria-label');
    panel.setAttribute('aria-labelledby', title.id);
  }
}
