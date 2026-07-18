import type { OnInit } from '@angular/core';
import { Directive, ElementRef, inject, input } from '@angular/core';

import type { KuiDropdownComponent } from './kui-dropdown.component';

@Directive({
  selector: '[kuiDropdownFor]',
  host: {
    '(click)': 'handleClick()',
    '(keydown)': 'handleKeydown($event)',
    '[attr.aria-expanded]': 'dropdown()?.isOpen()',
    '[attr.aria-controls]': 'dropdown()?.isOpen() ? dropdown()?.getPanelId() : null',
    '[attr.aria-haspopup]': '"listbox"',
  },
})
/** Connects a trigger element to a Kikita UI dropdown instance. */
export class KuiDropdownForDirective implements OnInit {
  readonly kuiDropdownFor = input.required<KuiDropdownComponent>();

  private readonly el = inject(ElementRef<HTMLElement>);

  protected dropdown() {
    return this.kuiDropdownFor();
  }

  ngOnInit(): void {
    this.kuiDropdownFor().setAnchor(this.el.nativeElement);
  }

  protected handleClick(): void {
    const dropdown = this.dropdown();

    if (dropdown.isOpen()) {
      dropdown.close();
      return;
    }

    // Per the ARIA APG listbox popup pattern, focus always moves onto the first option (or the
    // selected one) once the listbox is displayed, regardless of whether it was opened by mouse
    // or keyboard -- a mouse-opened panel with nothing focused inside it is unreachable by
    // keyboard once open (every option is `tabindex="-1"`; nothing is next in tab order).
    dropdown.open();
    this.focusOption('first');
  }

  protected handleKeydown(event: KeyboardEvent): void {
    const dropdown = this.dropdown();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!dropdown.isOpen()) dropdown.open();
      this.focusOption('first');
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!dropdown.isOpen()) dropdown.open();
      this.focusOption('last');
      return;
    }

    // Native <button> triggers already activate on Enter/Space via their own click event
    // (handled by handleClick above); handling it here too would double-toggle the dropdown.
    if (this.el.nativeElement.tagName === 'BUTTON') return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    if (dropdown.isOpen()) {
      dropdown.close();
      return;
    }
    dropdown.open();
    this.focusOption('first');
  }

  /** Moves real DOM focus onto the panel's first/last selectable option, once it has rendered. */
  private focusOption(which: 'first' | 'last'): void {
    setTimeout(() => {
      const panel = this.dropdown().getPanel();
      const opts = panel?.querySelectorAll<HTMLElement>(
        '.kui-listbox-option:not(.kui-listbox-option--disabled)',
      );
      if (!opts?.length) return;
      (which === 'last' ? opts[opts.length - 1] : opts[0]).focus();
    }, 0);
  }
}
