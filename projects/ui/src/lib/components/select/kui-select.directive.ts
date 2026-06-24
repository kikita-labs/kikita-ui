import {
  booleanAttribute,
  ComponentRef,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';

import { KuiOptionContext } from '../dropdown/kui-option-context.token';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KUI_FIELD_OPTIONS } from '../../tokens/kui-field-options.token';
import { KUI_SELECT_OPTIONS } from '../../tokens/kui-select-options.token';
import { KuiSelectInputSuffixComponent } from './kui-select-input-suffix.component';

@Directive({
  selector: 'input[kuiSelect]',
  host: {
    class: 'kui-input',
    readonly: 'readonly',
    role: 'combobox',
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'none',
    '[attr.aria-expanded]': 'dropdownOpen()',
    '[attr.placeholder]': 'placeholder()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.data-has-clear]': 'showClear() ? "" : null',
    '(click)': 'handleClick($event)',
    '(keydown)': 'handleKeydown($event)',
  },
})
export class KuiSelectDirective<T = unknown> implements OnDestroy, KuiOptionContext {
  readonly kuiValue = model<T | null>(null);
  readonly kuiLabelFn = input<((item: T) => string) | undefined>();
  readonly placeholder = input('');
  readonly clearable = input<boolean | undefined>();
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly field = inject(KuiFieldComponent, { optional: true });
  private readonly fieldOpts = inject(KUI_FIELD_OPTIONS, { optional: true });
  private readonly selectOpts = inject(KUI_SELECT_OPTIONS, { optional: true });

  protected readonly dropdownOpen = computed(
    () => this.field?.getDropdown()?.isOpen() ?? false,
  );

  protected readonly effectiveClearable = computed(() => {
    const own = this.clearable();
    if (own !== undefined) return own;
    if (this.selectOpts?.clearable !== undefined) return this.selectOpts.clearable!;
    if (this.fieldOpts?.clearable !== undefined) return this.fieldOpts.clearable!;
    return false;
  });

  protected readonly showClear = computed(
    () => this.effectiveClearable() && this.kuiValue() !== null && !this.disabled(),
  );

  readonly isSelected = (value: unknown): boolean => value === this.kuiValue();
  readonly select = (value: unknown): void => {
    this.kuiValue.set(value as T);
  };

  private _keyboardOpened = false;
  private readonly suffixRef: ComponentRef<KuiSelectInputSuffixComponent>;

  constructor() {
    this.field?.registerSelectContext(this);

    this.suffixRef = this.vcr.createComponent(KuiSelectInputSuffixComponent);

    effect(() => {
      this.suffixRef.setInput('clearable', this.effectiveClearable());
      this.suffixRef.setInput('hasValue', this.kuiValue() !== null);
      this.suffixRef.setInput('isOpen', this.dropdownOpen());
    });

    effect(() => {
      const v = this.kuiValue();
      const labelFn = this.kuiLabelFn();
      this.el.nativeElement.value = v != null ? (labelFn ? labelFn(v) : String(v)) : '';
    });

    effect(() => {
      this.field?.setSelectDisabled(this.disabled());
    });

    // Refocus input when dropdown closes after keyboard-open
    effect(() => {
      const dropdown = this.field?.getDropdown();
      if (!dropdown) return;
      if (!dropdown.isOpen() && this._keyboardOpened) {
        this._keyboardOpened = false;
        this.el.nativeElement.focus();
      }
    });

    this.suffixRef.instance.cleared.subscribe(() => {
      this.kuiValue.set(null);
    });
  }

  protected handleClick(e: MouseEvent): void {
    if (this.disabled()) {
      e.stopPropagation();
    }
  }

  protected handleKeydown(e: KeyboardEvent): void {
    if (this.disabled()) return;
    const dropdown = this.field?.getDropdown();
    if (!dropdown) return;

    if (!dropdown.isOpen()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        this._keyboardOpened = true;
        dropdown.open();
        this.focusOption(e.key === 'ArrowUp' ? 'last' : 'first', true);
      }
    } else {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.focusOption('first', false);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.focusOption('last', false);
          break;
      }
    }
  }

  private focusOption(which: 'first' | 'last', useTimeout: boolean): void {
    const fn = () => {
      const panel = this.field?.getDropdown()?.getPanel();
      const opts = panel?.querySelectorAll<HTMLElement>(
        '.kui-listbox-option:not(.kui-listbox-option--disabled)',
      );
      if (!opts?.length) return;
      (which === 'last' ? opts[opts.length - 1] : opts[0]).focus();
    };
    if (useTimeout) setTimeout(fn, 0);
    else fn();
  }

  ngOnDestroy(): void {
    this.field?.registerSelectContext(null);
    this.field?.setSelectDisabled(false);
  }
}
