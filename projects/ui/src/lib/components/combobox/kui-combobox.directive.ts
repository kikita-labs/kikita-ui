import {
  ComponentRef,
  Directive,
  ElementRef,
  Signal,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  output,
  ViewContainerRef,
} from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

import { KUI_COMBOBOX_OPTIONS } from '../../tokens/kui-combobox-options.token';
import { KUI_FIELD_OPTIONS } from '../../tokens/kui-field-options.token';
import { KuiOptionContext } from '../dropdown/kui-option-context.token';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiComboboxInputSuffixComponent } from './kui-combobox-input-suffix.component';
import { KuiComboboxMode } from './kui-combobox-mode.type';

function optionalBooleanAttribute(value: unknown): boolean | undefined {
  return value == null ? undefined : booleanAttribute(value);
}

/**
 * Converts a native text input into a searchable Kikita UI combobox trigger.
 *
 * Place it inside `kui-field` with a sibling `kui-dropdown`. Use `(search)` to load
 * remote options or filter local data, then render matching options with `kuiOption`.
 *
 * @example
 * ```html
 * <kui-field label="Assignee">
 *   <input kuiCombobox [(value)]="assignee" [(query)]="query" (search)="load($event)" />
 *   <kui-dropdown>
 *     @for (person of people(); track person.id) {
 *       <button kuiOption [value]="person">{{ person.name }}</button>
 *     }
 *   </kui-dropdown>
 * </kui-field>
 * ```
 */
@Directive({
  selector: 'input[kuiCombobox]',
  host: {
    class: 'kui-input',
    role: 'combobox',
    autocomplete: 'off',
    'aria-haspopup': 'listbox',
    '[attr.id]': 'hostId()',
    '[attr.aria-expanded]': 'dropdownOpen()',
    '[attr.aria-controls]': 'dropdownPanelId()',
    '[attr.aria-autocomplete]': 'mode() === "free" ? "both" : "list"',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'effectiveInvalid() ? "true" : null',
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
/** Adds searchable combobox behavior to a native input. */
export class KuiComboboxDirective<T = unknown>
  implements OnDestroy, KuiOptionContext, FormValueControl<T | string | null>
{
  /** Current selected value. Bound by `[formField]` or `[(value)]`. */
  readonly value = model<T | string | null>(null);
  /** Current user search text. */
  readonly query = model('');
  /** Emitted whenever the user edits the search text. Use it for API requests. */
  readonly search = output<string>();

  /** Whether the control is disabled. Set by `[formField]` or `[disabled]` directly. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Whether the control is readonly. Set by `[formField]` or `[readonly]` directly. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Whether the control has validation errors. Set by `[formField]`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Current validation errors. Set by `[formField]`. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  /** Whether the control has been touched. Set by `[formField]`. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Emitted when the dropdown closes; marks the control as touched in the form system. */
  readonly touch = output<void>();
  /** Explicit id override. If omitted inside `kui-field`, the field id is used. */
  readonly id = input<string | undefined>();

  /** Maps a selected value to display text. Required when `T` is not a primitive. */
  readonly kuiLabelFn = input<((item: T) => string) | undefined>();
  /** Placeholder text shown when no value is selected. */
  readonly placeholder = input('');
  /** Filtering behavior. `async` keeps filtering outside the directive. */
  readonly mode = input<KuiComboboxMode>('filter');
  /** Shows a clear button when the combobox has selected value or search text. */
  readonly clearable = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });
  /** Shows a loading affordance in the field suffix. */
  readonly loading = input(false, { transform: booleanAttribute });

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly field = inject(KuiFieldComponent, { optional: true });
  private readonly fieldOpts = inject(KUI_FIELD_OPTIONS, { optional: true });
  private readonly comboboxOpts = inject(KUI_COMBOBOX_OPTIONS, { optional: true });
  private readonly suffixRef: ComponentRef<KuiComboboxInputSuffixComponent>;
  private wasOpen = false;
  private pointerStartedOnInput = false;

  protected readonly dropdownOpen = computed(() => this.field?.getDropdown()?.isOpen() ?? false);
  protected readonly dropdownPanelId = computed(() =>
    this.dropdownOpen() ? (this.field?.getDropdown()?.getPanelId() ?? null) : null,
  );
  protected readonly hostId = computed(() => this.id() ?? this.field?.controlId ?? null);
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);
  protected readonly effectiveInvalid = computed(
    () => this.invalid() || Boolean(this.field?.invalid()),
  );
  protected readonly hasValue = computed(() => this.value() != null || this.query().length > 0);
  protected readonly effectiveClearable = computed(() => {
    const own = this.clearable();
    if (own !== undefined) return own;
    if (this.comboboxOpts?.clearable !== undefined) return this.comboboxOpts.clearable!;
    if (this.fieldOpts?.clearable !== undefined) return this.fieldOpts.clearable!;
    return true;
  });
  protected readonly showClear = computed(
    () => this.effectiveClearable() && this.hasValue() && !this.disabled() && !this.readonly(),
  );

  readonly isSelected = (value: unknown): Signal<boolean> | boolean => value === this.value();

  readonly select = (value: unknown): void => {
    if (this.disabled() || this.readonly()) return;
    this.value.set(value as T);
    this.query.set('');
    this.writeNativeValue(this.labelFor(value as T));
  };

  readonly shouldCloseOnSelect = (): boolean => true;

  constructor() {
    this.field?.registerSelectContext(this);
    this.suffixRef = this.vcr.createComponent(KuiComboboxInputSuffixComponent);

    effect(() => {
      this.suffixRef.setInput('clearable', this.effectiveClearable());
      this.suffixRef.setInput('hasValue', this.hasValue());
      this.suffixRef.setInput('isOpen', this.dropdownOpen());
      this.suffixRef.setInput('loading', this.loading());
      this.suffixRef.setInput('disabled', this.disabled());
      this.suffixRef.setInput('readonly', this.readonly());
    });

    effect(() => {
      const value = this.value();
      this.writeNativeValue(value == null ? this.query() : this.labelFor(value as T));
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

    this.suffixRef.instance.cleared.subscribe(() => this.clear());
    this.suffixRef.instance.toggled.subscribe(() => this.toggleDropdown());
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

    const nextQuery = (event.target as HTMLInputElement).value;
    this.query.set(nextQuery);
    this.search.emit(nextQuery);

    if (this.mode() === 'free') {
      this.value.set(nextQuery);
    } else {
      this.value.set(null);
    }

    this.openDropdown();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.readonly()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.openDropdown();
        this.focusOption('first', true);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.openDropdown();
        this.focusOption('last', true);
        break;
      case 'Enter':
      case ' ':
        if (!this.dropdownOpen()) {
          event.preventDefault();
          this.openDropdown();
        }
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
    this.value.set(null);
    this.query.set('');
    this.writeNativeValue('');
    this.search.emit('');
    this.field?.getDropdown()?.close();
    this.el.nativeElement.focus();
  }

  private toggleDropdown(): void {
    if (this.disabled() || this.readonly()) return;
    this.el.nativeElement.focus();
    this.field?.getDropdown()?.toggle();
  }

  protected openDropdown(): void {
    this.field?.getDropdown()?.open();
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

  private labelFor(value: T): string {
    return this.kuiLabelFn()?.(value) ?? String(value);
  }

  private writeNativeValue(value: string): void {
    if (this.el.nativeElement.value !== value) {
      this.el.nativeElement.value = value;
    }
  }

  ngOnDestroy(): void {
    this.field?.registerSelectContext(null);
    this.field?.setSelectDisabled(false);
    this.suffixRef.destroy();
  }
}
