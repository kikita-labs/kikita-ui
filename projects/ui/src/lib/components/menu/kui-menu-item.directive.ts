import { booleanAttribute, Directive, ElementRef, inject, input } from '@angular/core';

import type { KuiMenuItemAppearance } from './kui-menu-item-appearance.type';

let nextMenuItemId = 0;

/** Action item inside a `kui-menu` panel. */
@Directive({
  selector: 'button[kuiMenuItem], a[kuiMenuItem]',
  host: {
    class: 'kui-menu-item',
    role: 'menuitem',
    '[attr.id]': 'itemId',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.disabled]': 'isButton() && disabled() ? "" : null',
    '[attr.tabindex]': 'disabled() ? "-1" : "-1"',
    '[attr.data-kui-appearance]': 'appearance()',
    '[class.kui-menu-item--disabled]': 'disabled()',
    '(click)': 'onClick($event)',
  },
})
export class KuiMenuItemDirective {
  /** Item visual appearance. Use `destructive` for dangerous actions. */
  readonly appearance = input<KuiMenuItemAppearance>('neutral');

  /** Prevents activation and applies disabled semantics. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Stable id used for active descendant and tests. */
  protected readonly itemId = `kui-menu-item-${nextMenuItemId++}`;

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Focuses the host item. */
  focus(): void {
    this.el.nativeElement.focus();
  }

  /** Whether this item can receive keyboard focus. */
  isFocusable(): boolean {
    return !this.disabled();
  }

  /** Returns the native host element. */
  getElement(): HTMLElement {
    return this.el.nativeElement;
  }

  protected isButton(): boolean {
    return this.el.nativeElement.tagName === 'BUTTON';
  }

  protected onClick(event: Event): void {
    if (!this.disabled()) return;

    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
