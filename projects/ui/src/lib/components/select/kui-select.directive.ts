import {
  Signal,
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
  output,
  ViewContainerRef,
} from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

import { KuiOptionContext } from '../dropdown/kui-option-context.token';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KUI_FIELD_OPTIONS } from '../../tokens/kui-field-options.token';
import { KUI_SELECT_OPTIONS } from '../../tokens/kui-select-options.token';
import {
  KuiSelectChipItem,
  KuiSelectInputSuffixComponent,
} from './kui-select-input-suffix.component';

/** Multiple select value presentation mode. */
export type KuiSelectMultipleDisplay = 'chips' | 'text';

function optionalNumberAttribute(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

@Directive({
  selector: 'input[kuiSelect]',
  host: {
    class: 'kui-input',
    readonly: 'readonly',
    role: 'combobox',
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'none',
    '[attr.id]': 'hostId()',
    '[attr.aria-expanded]': 'dropdownOpen()',
    '[attr.aria-controls]': 'dropdownPanelId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'effectiveInvalid() ? "true" : null',
    '[attr.placeholder]': 'effectivePlaceholder()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.data-has-clear]': 'showClear() ? "" : null',
    '[attr.data-kui-multiple]': 'multiple() ? "" : null',
    '[attr.data-kui-has-chips]': 'showChipLayer() ? "" : null',
    '(pointerdown)': 'handlePointerdown()',
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
  implements OnDestroy, KuiOptionContext, FormValueControl<T | readonly T[] | null>
{
  /** Current selected value. In multiple mode this is an array. Bound by `[formField]` or `[(value)]`. */
  readonly value = model<T | readonly T[] | null>(null);

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
  /** Emitted when the dropdown closes; marks the control as touched in the form system. */
  readonly touch = output<void>();
  /** Explicit id override. If omitted inside `kui-field`, the field id is used. */
  readonly id = input<string | undefined>();

  /** Enables multiple selected values. The control value becomes `readonly T[]`. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Maximum number of selected chips rendered before collapsed `+N` overflow. */
  readonly maxVisibleChips = input<number | undefined, unknown>(undefined, {
    transform: optionalNumberAttribute,
  });
  /** Presentation used for multiple selected values. */
  readonly multipleDisplay = input<KuiSelectMultipleDisplay>('chips');
  /** Formats the full selected value array when `multipleDisplay` is `text`. */
  readonly multipleTextFn = input<((items: readonly T[]) => string) | undefined>();

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
  protected readonly dropdownPanelId = computed(() =>
    this.dropdownOpen() ? (this.field?.getDropdown()?.getPanelId() ?? null) : null,
  );
  protected readonly hostId = computed(() => this.id() ?? this.field?.controlId ?? null);
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);
  protected readonly effectiveInvalid = computed(
    () => this.invalid() || Boolean(this.field?.invalid()),
  );

  protected readonly effectiveClearable = computed(() => {
    const own = this.clearable();
    if (own !== undefined) return own;
    if (this.selectOpts?.clearable !== undefined) return this.selectOpts.clearable!;
    if (this.fieldOpts?.clearable !== undefined) return this.fieldOpts.clearable!;
    return false;
  });

  protected readonly selectedValues = computed<readonly T[]>(() => {
    const current = this.value();
    return Array.isArray(current) ? current : current == null ? [] : [current as T];
  });

  protected readonly hasValue = computed(() => this.selectedValues().length > 0);

  protected readonly showClear = computed(
    () => this.effectiveClearable() && this.hasValue() && !this.disabled() && !this.readonly(),
  );

  protected readonly effectivePlaceholder = computed(() =>
    this.multiple() && this.hasValue() ? '' : this.placeholder(),
  );

  protected readonly showChipLayer = computed(
    () => this.multiple() && this.multipleDisplay() === 'chips' && this.hasValue(),
  );

  protected readonly effectiveMaxVisibleChips = computed(() => {
    const own = this.maxVisibleChips();
    if (own !== undefined) return own;
    if (this.selectOpts?.maxVisibleChips !== undefined) return this.selectOpts.maxVisibleChips;
    return 3;
  });

  private readonly selectedChipItems = computed<readonly KuiSelectChipItem[]>(() => {
    if (!this.showChipLayer()) return [];
    const labelFn = this.kuiLabelFn();
    return this.selectedValues().map((item) => ({
      value: item,
      label: this.labelFor(item, labelFn),
    }));
  });

  readonly isSelected = (v: unknown): Signal<boolean> | boolean => {
    if (!this.multiple()) return v === this.value();
    return computed(() => {
      const current = this.value();
      return Array.isArray(current) ? current.some((item) => item === v) : false;
    });
  };

  readonly select = (v: unknown): void => {
    if (!this.multiple()) {
      this.value.set(v as T);
      return;
    }

    const current = this.value();
    const values = Array.isArray(current) ? [...current] : [];
    const index = values.findIndex((item) => item === v);

    if (index >= 0) {
      values.splice(index, 1);
    } else {
      values.push(v as T);
    }

    this.value.set(values);
  };
  readonly shouldCloseOnSelect = (): boolean => !this.multiple();

  private _keyboardOpened = false;
  private _wasOpen = false;
  private pointerStartedOnInput = false;
  private readonly suffixRef: ComponentRef<KuiSelectInputSuffixComponent>;

  constructor() {
    this.field?.registerSelectContext(this);

    this.suffixRef = this.vcr.createComponent(KuiSelectInputSuffixComponent);

    effect(() => {
      this.suffixRef.setInput('clearable', this.effectiveClearable());
      this.suffixRef.setInput('hasValue', this.hasValue());
      this.suffixRef.setInput('isOpen', this.dropdownOpen());
      this.suffixRef.setInput('disabled', this.disabled());
      this.suffixRef.setInput('readonly', this.readonly());
      this.suffixRef.setInput('selectedItems', this.selectedChipItems());
      this.suffixRef.setInput('maxVisibleChips', this.effectiveMaxVisibleChips());
      this.suffixRef.setInput('valueTemplate', this.field?.selectValueTemplate() ?? null);
    });

    effect(() => {
      const v = this.value();
      const labelFn = this.kuiLabelFn();
      if (Array.isArray(v)) {
        this.el.nativeElement.value =
          this.multipleTextFn()?.(v) ?? v.map((item) => this.labelFor(item, labelFn)).join(', ');
      } else {
        this.el.nativeElement.value = v != null ? this.labelFor(v as T, labelFn) : '';
      }
    });

    effect(() => {
      this.field?.setSelectDisabled(this.disabled() || this.readonly());
    });

    effect(() => {
      const dropdown = this.field?.getDropdown();
      if (!dropdown) return;
      dropdown.closeOnSelect.set(!this.multiple());
      const isOpen = dropdown.isOpen();

      if (this._wasOpen && !isOpen) {
        this.touch.emit();
        if (this._keyboardOpened && this.shouldRestoreFocus()) {
          this._keyboardOpened = false;
          this.el.nativeElement.focus();
        }
        this._keyboardOpened = false;
      }

      this._wasOpen = isOpen;
    });

    this.suffixRef.instance.cleared.subscribe(() => {
      this.clearValue();
    });

    this.suffixRef.instance.removed.subscribe((value) => {
      this.removeValue(value);
    });

    this.suffixRef.instance.toggled.subscribe(() => {
      this.toggleDropdown();
    });
  }

  protected handleClick(e: MouseEvent): void {
    e.stopPropagation();
    if (this.disabled() || this.readonly()) return;
    if (!this.pointerStartedOnInput) return;
    this.pointerStartedOnInput = false;
    this.toggleDropdown();
  }

  protected handlePointerdown(): void {
    this.pointerStartedOnInput = true;
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
        case 'Tab':
          dropdown.close();
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

  private removeValue(value: unknown): void {
    if (!this.multiple() || this.disabled() || this.readonly()) return;
    this.value.set(this.selectedValues().filter((item) => item !== value));
  }

  private clearValue(): void {
    if (this.disabled() || this.readonly()) return;
    this.value.set(this.multiple() ? [] : null);
    this.field?.getDropdown()?.close();
    this.el.nativeElement.focus();
  }

  private toggleDropdown(): void {
    if (this.disabled() || this.readonly()) return;
    const dropdown = this.field?.getDropdown();
    if (!dropdown) return;
    this.el.nativeElement.focus();
    dropdown.toggle();
  }

  private shouldRestoreFocus(): boolean {
    const ownerDocument = this.el.nativeElement.ownerDocument;
    const panel = this.field?.getDropdown()?.getPanel();
    const active = ownerDocument.activeElement;

    return !active || active === ownerDocument.body || Boolean(panel?.contains(active));
  }

  private labelFor(value: T, labelFn: ((item: T) => string) | undefined): string {
    return labelFn ? labelFn(value) : String(value);
  }

  ngOnDestroy(): void {
    this.field?.registerSelectContext(null);
    this.field?.setSelectDisabled(false);
  }
}
