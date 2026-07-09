import {
  ComponentRef,
  Directive,
  ElementRef,
  OnDestroy,
  ViewContainerRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

import { startOfMonth } from '../calendar/kui-calendar-date.util';
import { KUI_FIELD_OPTIONS } from '../../tokens/kui-field-options.token';
import { KuiFieldComponent } from '../field/kui-field.component';
import { formatDisplayDate, parseDisplayDate } from './kui-date-format.util';
import { KuiDatePickerInputAffixComponent } from './kui-date-picker-input-affix.component';

function optionalBooleanAttribute(value: unknown): boolean | undefined {
  return value == null ? undefined : booleanAttribute(value);
}

/**
 * Converts a native text input into a Kikita UI date picker trigger. Text is parsed/
 * formatted as `dd.MM.yyyy`; pair it with `kui-calendar` inside a sibling `kui-dropdown`
 * for the popover grid — both bound to the same `value` keep in sync automatically.
 *
 * @example
 * ```html
 * <kui-field label="Meeting date">
 *   <input kuiDatePicker [(value)]="date" />
 *   <kui-dropdown panelRole="dialog" panelWidth="content" maxHeight="420px">
 *     <kui-calendar flat [(value)]="date" [showFooter]="true" />
 *   </kui-dropdown>
 * </kui-field>
 * ```
 */
@Directive({
  selector: 'input[kuiDatePicker]',
  host: {
    class: 'kui-input',
    role: 'combobox',
    autocomplete: 'off',
    'aria-haspopup': 'dialog',
    '[attr.id]': 'hostId()',
    '[attr.aria-expanded]': 'dropdownOpen()',
    '[attr.aria-controls]': 'dropdownPanelId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'effectiveInvalid() ? "true" : null',
    '[attr.data-kui-invalid]': 'effectiveInvalid() ? "" : null',
    '[attr.placeholder]': 'placeholder()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.readonly]': 'readonly() ? "" : null',
    '[attr.data-has-clear]': 'showClear() ? "" : null',
    '(pointerdown)': 'handlePointerdown()',
    '(click)': 'handleClick($event)',
    '(input)': 'handleInput($event)',
    '(keydown)': 'handleKeydown($event)',
  },
})
export class KuiDatePickerDirective implements OnDestroy, FormValueControl<Date | null> {
  /** Selected date. Bound by `[formField]` or `[(value)]`. */
  readonly value = model<Date | null>(null);
  /**
   * First-of-month date a bound `kui-calendar` should display. Two-way — bind the same
   * signal on both `input[kuiDatePicker]` and `kui-calendar` to keep the popover's
   * displayed month in sync as the user types a valid date.
   */
  readonly viewDate = model<Date>(new Date());

  /** Whether the control is disabled. Set by `[formField]` or `[disabled]` directly. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Whether the control is readonly. Set by `[formField]` or `[readonly]` directly. Readonly inputs do not open the popover. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Whether the control has validation errors. Set by `[formField]`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Current validation errors. Set by `[formField]`. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  /** Whether the control has been touched. Set by `[formField]`. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Emitted when the popover closes; marks the control as touched in the form system. */
  readonly touch = output<void>();
  /** Explicit id override. If omitted inside `kui-field`, the field id is used. */
  readonly id = input<string | undefined>();

  /** Earliest selectable date (inclusive). Typing/selecting an earlier date is invalid. */
  readonly minDate = input<Date | undefined>(undefined);
  /** Latest selectable date (inclusive). Typing/selecting a later date is invalid. */
  readonly maxDate = input<Date | undefined>(undefined);
  /** Placeholder text shown when the field is empty. */
  readonly placeholder = input('dd.mm.yyyy');
  /** Shows a clear button when the picker has a value. */
  readonly clearable = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly field = inject(KuiFieldComponent, { optional: true });
  private readonly fieldOpts = inject(KUI_FIELD_OPTIONS, { optional: true });
  private readonly affixRef: ComponentRef<KuiDatePickerInputAffixComponent>;
  private wasOpen = false;
  private pointerStartedOnInput = false;
  private readonly rawText = signal('');
  private readonly parseFailed = signal(false);

  protected readonly dropdownOpen = computed(() => this.field?.getDropdown()?.isOpen() ?? false);
  protected readonly dropdownPanelId = computed(() =>
    this.dropdownOpen() ? (this.field?.getDropdown()?.getPanelId() ?? null) : null,
  );
  protected readonly hostId = computed(() => this.id() ?? this.field?.controlId ?? null);
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);
  protected readonly hasValue = computed(() => this.value() != null || this.rawText().length > 0);
  protected readonly effectiveClearable = computed(() => {
    const own = this.clearable();
    if (own !== undefined) return own;
    if (this.fieldOpts?.clearable !== undefined) return this.fieldOpts.clearable!;
    return true;
  });
  protected readonly showClear = computed(
    () => this.effectiveClearable() && this.hasValue() && !this.disabled() && !this.readonly(),
  );

  private readonly outOfRange = computed(() => {
    const value = this.value();
    if (!value) return false;
    const min = this.minDate();
    const max = this.maxDate();
    if (min && value.getTime() < min.getTime()) return true;
    if (max && value.getTime() > max.getTime()) return true;
    return false;
  });

  protected readonly effectiveInvalid = computed(
    () =>
      this.invalid() || Boolean(this.field?.invalid()) || this.parseFailed() || this.outOfRange(),
  );

  constructor() {
    this.affixRef = this.vcr.createComponent(KuiDatePickerInputAffixComponent);

    effect(() => {
      this.affixRef.setInput('clearable', this.effectiveClearable());
      this.affixRef.setInput('hasValue', this.hasValue());
      this.affixRef.setInput('isOpen', this.dropdownOpen());
      this.affixRef.setInput('disabled', this.disabled());
      this.affixRef.setInput('readonly', this.readonly());
    });

    effect(() => {
      const value = this.value();
      this.parseFailed.set(false);
      this.writeNativeValue(value ? formatDisplayDate(value) : '');
    });

    effect(() => {
      this.field?.setSelectDisabled(this.disabled() || this.readonly());
    });

    effect(() => {
      const dropdown = this.field?.getDropdown();
      if (!dropdown) return;
      const isOpen = dropdown.isOpen();

      if (this.wasOpen && !isOpen) {
        this.touch.emit();
      }

      this.wasOpen = isOpen;
    });

    this.affixRef.instance.cleared.subscribe(() => this.clear());
    this.affixRef.instance.toggled.subscribe(() => this.toggleDropdown());
  }

  protected handleClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled() || this.readonly()) return;
    if (!this.pointerStartedOnInput) return;
    this.pointerStartedOnInput = false;
    this.toggleDropdown();
  }

  protected handlePointerdown(): void {
    this.pointerStartedOnInput = true;
  }

  protected handleInput(event: Event): void {
    if (this.disabled() || this.readonly()) return;

    const text = (event.target as HTMLInputElement).value;
    this.rawText.set(text);
    const parsed = parseDisplayDate(text);

    if (parsed) {
      this.parseFailed.set(false);
      this.value.set(parsed);
      this.viewDate.set(startOfMonth(parsed));
    } else {
      this.parseFailed.set(text.length > 0);
    }

    this.openDropdown();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.readonly()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.dropdownOpen()) {
          this.focusCalendarGrid();
        } else {
          this.openDropdown();
        }
        break;
      case 'Enter':
        event.preventDefault();
        this.dropdownOpen() ? this.field?.getDropdown()?.close() : this.openDropdown();
        break;
      case 'Escape':
        this.field?.getDropdown()?.close();
        break;
      case 'Tab':
        this.field?.getDropdown()?.close();
        break;
    }
  }

  private clear(): void {
    if (this.disabled() || this.readonly()) return;
    this.rawText.set('');
    this.parseFailed.set(false);
    this.value.set(null);
    this.writeNativeValue('');
    this.field?.getDropdown()?.close();
    this.el.nativeElement.focus();
  }

  private toggleDropdown(): void {
    if (this.disabled() || this.readonly()) return;
    this.el.nativeElement.focus();
    this.field?.getDropdown()?.toggle();
  }

  protected openDropdown(): void {
    if (this.disabled() || this.readonly()) return;
    this.field?.getDropdown()?.open();
  }

  /**
   * Moves DOM focus from the text input into the open `kui-calendar`'s day grid (its roving
   * `tabindex="0"` cell), so a second ArrowDown starts grid navigation instead of doing nothing
   * -- ArrowLeft/Right already move the text caret while focus stays on the input, which is
   * correct, but ArrowDown has no caret meaning and should hand off to the calendar.
   */
  private focusCalendarGrid(): void {
    this.field
      ?.getDropdown()
      ?.getPanel()
      ?.querySelector<HTMLButtonElement>('.kui-calendar-day[tabindex="0"]')
      ?.focus();
  }

  private writeNativeValue(value: string): void {
    if (this.el.nativeElement.value !== value) {
      this.el.nativeElement.value = value;
    }
  }

  ngOnDestroy(): void {
    this.field?.setSelectDisabled(false);
    this.affixRef.destroy();
  }
}
