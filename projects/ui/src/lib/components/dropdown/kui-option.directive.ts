import {
  computed,
  Directive,
  inject,
  input,
  output,
} from '@angular/core';

import { KUI_OPTION_CONTEXT } from './kui-option-context.token';

@Directive({
  selector: '[kuiOption]',
  host: {
    class: 'kui-listbox-option',
    role: 'option',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() || null',
    '[class.kui-listbox-option--selected]': 'selected()',
    '[class.kui-listbox-option--disabled]': 'disabled()',
    '(click)': 'handleClick()',
  },
})
export class KuiOptionDirective {
  readonly kuiOption = input.required<unknown>();
  readonly disabled = input(false);

  readonly kuiOptionSelect = output<unknown>();

  private readonly ctx = inject(KUI_OPTION_CONTEXT, { optional: true });

  protected readonly selected = computed(() => {
    if (!this.ctx) return false;
    const result = this.ctx.isSelected(this.kuiOption());
    return typeof result === 'boolean' ? result : result();
  });

  protected handleClick(): void {
    if (this.disabled()) return;
    this.ctx?.select(this.kuiOption());
    this.kuiOptionSelect.emit(this.kuiOption());
  }
}
