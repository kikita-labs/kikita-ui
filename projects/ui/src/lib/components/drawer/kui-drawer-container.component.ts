import {
  Component,
  ComponentRef,
  ElementRef,
  EventEmitter,
  signal,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';

import type { KuiDrawerSide, KuiDrawerSize } from './kui-drawer.types';

let nextDrawerTitleId = 0;

/**
 * @internal
 * CDK overlay shell for a drawer: renders the backdrop and panel,
 * manages animations, focus trap, and backdrop-click dismissal.
 * Not part of the public API.
 */
@Component({
  selector: 'kui-drawer-container',
  template: `
    <div
      class="kui-drawer-backdrop"
      [class.kui-drawer-backdrop--closing]="isClosing()"
      (click)="onBackdropClick()"
    ></div>
    <div
      #drawerPanel
      class="kui-drawer"
      [class.kui-drawer--closing]="isClosing()"
      [attr.data-kui-side]="_side"
      [attr.data-kui-size]="_size"
      role="dialog"
      aria-modal="true"
      aria-label="Drawer"
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
      (click)="$event.stopPropagation()"
      (animationend)="onAnimationEnd($event)"
    >
      <ng-template cdkPortalOutlet />
    </div>
  `,
  imports: [CdkPortalOutlet, CdkTrapFocus],
  encapsulation: ViewEncapsulation.None,
})
/** Renders the modal drawer surface used by the drawer service. */
export class KuiDrawerContainerComponent {
  private readonly portalOutlet = viewChild.required(CdkPortalOutlet);
  private readonly drawerPanel = viewChild.required<ElementRef<HTMLElement>>('drawerPanel');

  protected readonly isClosing = signal(false);

  /** @internal Set by the service after the component is created. */
  _side: KuiDrawerSide = 'right';
  /** @internal Set by the service after the component is created. */
  _size: KuiDrawerSize = 'md';
  /** @internal Set by the service after the component is created. */
  _closeOnBackdropClick = true;

  private _closeResult: unknown;

  /** Emits the close result after the exit animation finishes. */
  readonly closed = new EventEmitter<unknown>();

  /** Attach the user-provided drawer component inside the panel. */
  attachContent<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    const ref = this.portalOutlet().attachComponentPortal(portal);
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
    if (this._closeOnBackdropClick) this.close();
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (this.isClosing() && event.animationName.startsWith('kui-drawer-out')) {
      this.closed.emit(this._closeResult);
    }
  }

  private bindAccessibleName(): void {
    const panel = this.drawerPanel().nativeElement;
    const title = panel.querySelector<HTMLElement>('.kui-drawer-title');

    if (!title) return;

    if (!title.id) {
      title.id = `kui-drawer-title-${nextDrawerTitleId++}`;
    }

    panel.removeAttribute('aria-label');
    panel.setAttribute('aria-labelledby', title.id);
  }
}
