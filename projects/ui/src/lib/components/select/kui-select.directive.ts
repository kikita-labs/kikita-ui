import {
  ComponentRef,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  output,
  ViewContainerRef,
} from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

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
/**
 * Converts a native `<input>` into a Kikita UI select control.
 *
 * Implements {@link FormValueControl} for Signal Forms integration via `[formField]`.
 * For standalone use, bind `[(value)]` directly.
 *
 * Must be placed inside `<kui-field>` with a sibling `<kui-dropdown>` to function.
 *
 * @example
 * ```html
 * <!-- Signal Forms -->
 * <kui-field label="Role">
 *   <input kuiSelect [formField]="myForm.role" [kuiLabelFn]="roleLabel" />
 *   <kui-dropdown>
 *     <div kuiOption value="engineer">Software Engineer</div>
 *   </kui-dropdown>
 * </kui-field>
 *
 * <!-- Standalone -->
 * <kui-field label="Role">
 *   <input kuiSelect [(value)]="role" />
 *   <kui-dropdown>
 *     <div kuiOption value="engineer">Software Engineer</div>
 *   </kui-dropdown>
 * </kui-field>
 * ```
 */
export class KuiSelectDirective<T = unknown>
  implements OnDestroy, KuiOptionContext, FormValueControl<T | null>
{
  /** Current selected value. Bound by `[formField]` or `[(value)]`. */
  readonly value = model<T | null>(null);

  /** Whether the control is disabled. Set by `[formField]` or `[disabled]` directly. */
  readonly disabled = input(false);
  /** Whether the control is readonly. Set by `[formField]` or `[readonly]` directly. */
  readonly readonly = input(false);
  /** Whether the control has validation errors. Set by `[formField]`. */
  readonly invalid = input(false);
  /** Current validation errors. Set by `[formField]`. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  /** Whether the control has been touched. Set by `[formField]`. */
  readonly touched = input(false);
  /** Emitted when the dropdown closes — marks the control as touched in the form system. */
  readonly touch = output<void>();

  /** Maps a selected value to its display string. Required when `T` is not a primitive. */
  readonly kuiLabelFn = input<((item: T) => string) | undefined>();
  /** Placeholder text shown when no value is selected. */
  readonly placeholder = input('');
  /**
   * Shows a clear button when a value is selected.
   * Falls back to {@link KUI_SELECT_OPTIONS} then {@link KUI_FIELD_OPTIONS} when undefined.
   */
  readonly clearable = input<boolean | undefined>();

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly field = inject(KuiFieldComponent, { optional: true });
  private readonly fieldOpts = inject(KUI_FIELD_OPTIONS, { optional: true });
  private readonly selectOpts = inject(KUI_SELECT_OPTIONS, { optional: true });

  protected readonly dropdownOpen = computed(() => this.field?.getDropdown()?.isOpen() ?? false);

  protected readonly effectiveClearable = computed(() => {
    const own = this.clearable();
    if (own !== undefined) return own;
    if (this.selectOpts?.clearable !== undefined) return this.selectOpts.clearable!;
    if (this.fieldOpts?.clearable !== undefined) return this.fieldOpts.clearable!;
    return false;
  });

  protected readonly showClear = computed(
    () => this.effectiveClearable() && this.value() !== null && !this.disabled(),
  );

  readonly isSelected = (v: unknown): boolean => v === this.value();
  readonly select = (v: unknown): void => {
    this.value.set(v as T);
  };

  private _keyboardOpened = false;
  private readonly suffixRef: ComponentRef<KuiSelectInputSuffixComponent>;

  constructor() {
    this.field?.registerSelectContext(this);

    this.suffixRef = this.vcr.createComponent(KuiSelectInputSuffixComponent);

    effect(() => {
      this.suffixRef.setInput('clearable', this.effectiveClearable());
      this.suffixRef.setInput('hasValue', this.value() !== null);
      this.suffixRef.setInput('isOpen', this.dropdownOpen());
    });

    effect(() => {
      const v = this.value();
      const labelFn = this.kuiLabelFn();
      this.el.nativeElement.value = v != null ? (labelFn ? labelFn(v) : String(v)) : '';
    });

    effect(() => {
      this.field?.setSelectDisabled(this.disabled());
    });

    effect(() => {
      const dropdown = this.field?.getDropdown();
      if (!dropdown) return;
      if (!dropdown.isOpen()) {
        this.touch.emit();
        if (this._keyboardOpened) {
          this._keyboardOpened = false;
          this.el.nativeElement.focus();
        }
      }
    });

    this.suffixRef.instance.cleared.subscribe(() => {
      this.value.set(null);
    });
  }

  protected handleClick(e: MouseEvent): void {
    if (this.disabled() || this.readonly()) {
      e.stopPropagation();
    }
  }

  protected handleKeydown(e: KeyboardEvent): void {
    if (this.disabled() || this.readonly()) return;
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
