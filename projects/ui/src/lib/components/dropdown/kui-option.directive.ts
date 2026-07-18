import {
  afterNextRender,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
} from '@angular/core';

import { KUI_OPTION_CONTEXT } from './kui-option-context.token';

let nextOptionId = 0;

@Directive({
  selector: '[kuiOption]',
  host: {
    class: 'kui-listbox-option',
    role: 'option',
    '[attr.id]': 'optionId',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.tabindex]': 'disabled() ? null : "-1"',
    '[class.kui-listbox-option--selected]': 'selected()',
    '[class.kui-listbox-option--disabled]': 'disabled()',
    '(click)': 'handleClick()',
    '(keydown)': 'handleKeydown($event)',
  },
})
/** Marks projected dropdown content as a selectable Kikita UI option. */
export class KuiOptionDirective {
  /** The value emitted and passed to the selection context when this option is chosen. */
  readonly value = input.required<unknown>();
  /** Prevents selection and applies disabled styling. */
  readonly disabled = input(false);

  /** Emitted when the option is selected. Useful for standalone usage without a select context. */
  readonly kuiOptionSelect = output<unknown>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ctx = inject(KUI_OPTION_CONTEXT, { optional: true });
  protected readonly optionId = `kui-option-${nextOptionId++}`;

  constructor() {
    const renderer = inject(Renderer2);
    const host = this.el.nativeElement;

    // afterNextRender: Angular has rendered projected content into host by this point.
    // Wrap existing children in .kui-listbox-option-text (flex:1, ellipsis),
    // then append .kui-listbox-check (flex-shrink:0, SVG via CSS mask).
    afterNextRender(() => {
      const textSpan = renderer.createElement('span');
      renderer.addClass(textSpan, 'kui-listbox-option-text');
      Array.from(host.childNodes).forEach((node) => renderer.appendChild(textSpan, node));
      renderer.appendChild(host, textSpan);

      const check = renderer.createElement('span');
      renderer.addClass(check, 'kui-listbox-check');
      renderer.setAttribute(check, 'aria-hidden', 'true');
      renderer.appendChild(host, check);
    });
  }

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
        if (this.ctx?.shouldCloseOnSelect?.() ?? true) {
          this.ctx?.close?.();
        }
        break;
      case 'Tab':
        this.ctx?.close?.();
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
