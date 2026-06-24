import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

interface DropdownPos {
  top: number;
  left: number;
  minWidth: number;
}

@Component({
  selector: 'kui-dropdown',
  template: `
    @if (visible()) {
      <div
        #panelEl
        class="kui-dropdown"
        [class.kui-dropdown--closing]="isClosing()"
        [class.kui-dropdown--scroll]="maxHeight() != null"
        [style.top.px]="pos()?.top"
        [style.left.px]="pos()?.left"
        [style.min-width.px]="pos()?.minWidth"
        [style.max-height]="maxHeight()"
        role="listbox"
        (click)="handlePanelClick($event)"
        (animationend)="onAnimationEnd($event)"
      >
        <ng-content />
      </div>
    }
  `,
  styles: `
    :host { display: contents; }
    .kui-dropdown { position: fixed; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class KuiDropdownComponent {
  readonly anchor = input<HTMLElement | ElementRef<HTMLElement> | null>(null);
  readonly maxHeight = input<string | null>('240px');
  readonly offset = input(4);

  readonly isOpen = signal(false);

  protected readonly isClosing = signal(false);
  protected readonly pos = signal<DropdownPos | null>(null);
  protected readonly visible = computed(() => this.isOpen() || this.isClosing());

  private readonly _anchorEl = signal<HTMLElement | null>(null);
  private readonly panelEl = viewChild<ElementRef<HTMLElement>>('panelEl');
  private readonly destroyRef = inject(DestroyRef);
  private cleanup: (() => void) | null = null;

  private resolveAnchor(): HTMLElement | null {
    const internal = this._anchorEl();
    if (internal) return internal;
    const a = this.anchor();
    if (!a) return null;
    return a instanceof ElementRef ? a.nativeElement : a;
  }

  private updatePosition(): void {
    const el = this.resolveAnchor();
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.pos.set({ top: rect.bottom + this.offset(), left: rect.left, minWidth: rect.width });
  }

  setAnchor(el: HTMLElement): void {
    this._anchorEl.set(el);
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    this.updatePosition();
    this.isOpen.set(true);
    this.isClosing.set(false);

    const onScroll = () => this.updatePosition();
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        this.close();
      }
    };
    document.addEventListener('keydown', onKeydown, { capture: true });

    let clickListener: ((e: MouseEvent) => void) | null = null;
    const timeoutId = setTimeout(() => {
      clickListener = (e: MouseEvent) => {
        const anchor = this.resolveAnchor();
        const panel = this.panelEl()?.nativeElement;
        const target = e.target as Node;
        if (!anchor?.contains(target) && !panel?.contains(target)) {
          this.close();
        }
      };
      document.addEventListener('click', clickListener, { capture: true });
    }, 0);

    const stop = () => {
      clearTimeout(timeoutId);
      document.removeEventListener('scroll', onScroll, { capture: true });
      document.removeEventListener('keydown', onKeydown, { capture: true });
      if (clickListener) {
        document.removeEventListener('click', clickListener, { capture: true });
      }
    };

    this.cleanup = stop;
    this.destroyRef.onDestroy(stop);
  }

  close(): void {
    this.cleanup?.();
    this.cleanup = null;
    this.isClosing.set(true);
  }

  protected handlePanelClick(e: MouseEvent): void {
    const target = e.target as Element;
    if (target.closest('.kui-listbox-option:not(.kui-listbox-option--disabled)')) {
      this.close();
    }
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (this.isClosing() && event.animationName === 'kui-dropdown-out') {
      this.isOpen.set(false);
      this.isClosing.set(false);
    }
  }
}
