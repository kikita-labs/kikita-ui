import {
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';

import { KUI_OPTION_CONTEXT } from './kui-option-context.token';
import { KuiDropdownComponent } from './kui-dropdown.component';

@Directive({
  selector: '[kuiOption]',
  host: {
    class: 'kui-listbox-option',
    role: 'option',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.tabindex]': 'disabled() ? null : "-1"',
    '[class.kui-listbox-option--selected]': 'selected()',
    '[class.kui-listbox-option--disabled]': 'disabled()',
    '(click)': 'handleClick()',
    '(keydown)': 'handleKeydown($event)',
  },
})
export class KuiOptionDirective {
  readonly value = input.required<unknown>();
  readonly disabled = input(false);

  readonly kuiOptionSelect = output<unknown>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ctx = inject(KUI_OPTION_CONTEXT, { optional: true });
  private readonly dropdown = inject(KuiDropdownComponent, { optional: true });

  protected readonly selected = computed(() => {
    if (!this.ctx) return false;
    const result = this.ctx.isSelected(this.value());
    return typeof result === 'boolean' ? result : result();
  });

  protected handleClick(): void {
    if (this.disabled()) return;
    this.ctx?.select(this.value());
    this.kuiOptionSelect.emit(this.value());
  }

  protected handleKeydown(e: KeyboardEvent): void {
    const panel = this.el.nativeElement.closest<HTMLElement>('[role="listbox"]');
    if (!panel) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const opts = this.navigableOptions(panel);
        const next = opts[opts.indexOf(this.el.nativeElement) + 1];
        next?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const opts = this.navigableOptions(panel);
        const prev = opts[opts.indexOf(this.el.nativeElement) - 1];
        prev?.focus();
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.handleClick();
        this.dropdown?.close();
        break;
      case 'Tab':
        this.dropdown?.close();
        break;
    }
  }

  private navigableOptions(panel: HTMLElement): HTMLElement[] {
    return [
      ...panel.querySelectorAll<HTMLElement>(
        '.kui-listbox-option:not(.kui-listbox-option--disabled)',
      ),
    ];
  }
}
