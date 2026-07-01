import {
  Component,
  computed,
  ElementRef,
  booleanAttribute,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

import { KUI_FIELD_OPTIONS } from '../../tokens/kui-field-options.token';
import { KuiChipDirective } from '../chip/kui-chip.directive';
import { KuiChipRemoveDirective } from '../chip/kui-chip-remove.directive';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiComboboxMode } from './kui-combobox-mode.type';
import { KuiComboboxSize } from './kui-combobox-size.type';

let nextComboboxId = 0;

function optionalBooleanAttribute(value: unknown): boolean | undefined {
  return value == null ? undefined : booleanAttribute(value);
}

/**
 * Searchable combobox for selecting one or more values from a list.
 *
 * Implements {@link FormValueControl} for Signal Forms integration via `[formField]`.
 */
@Component({
  selector: 'kui-combobox',
  imports: [KuiChipDirective, KuiChipRemoveDirective],
  templateUrl: './kui-combobox.component.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'kui-combobox',
    '[class.kui-combobox--open]': 'open()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '(focusout)': 'handleFocusOut($event)',
  },
})
export class KuiComboboxComponent<T = unknown> implements FormValueControl<
  T | readonly T[] | string | null
> {
  /** Available options. */
  readonly options = input<readonly T[]>([]);
  /** Current selected value. In multiple mode this is an array. */
  readonly value = model<T | readonly T[] | string | null>(null);
  /** Current text query. */
  readonly query = model('');
  /** Maps an option to display text. Defaults to `String(option)`. */
  readonly labelFn = input<((item: T) => string) | undefined>();
  /** Placeholder shown when the combobox is empty. */
  readonly placeholder = input('');
  /** Combobox size. Falls back to the parent `kui-field` size when omitted. */
  readonly size = input<KuiComboboxSize | undefined>();
  /** Filtering behavior. */
  readonly mode = input<KuiComboboxMode>('filter');
  /** Enables multiple selected values. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /**
   * Shows a clear affordance when the combobox has a value or query.
   * Falls back to {@link KUI_FIELD_OPTIONS} when undefined.
   */
  readonly clearable = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });
  /** Shows the loading row and loader affordance. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Prevents interaction and marks the control disabled. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Prevents editing while keeping the value readable. */
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

  protected readonly fallbackInputId = `kui-combobox-input-${nextComboboxId}`;
  protected readonly listId = `kui-combobox-list-${nextComboboxId++}`;
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(0);
  protected readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly field = inject(KuiFieldComponent, { optional: true });
  private readonly fieldOpts = inject(KUI_FIELD_OPTIONS, { optional: true });

  protected readonly inputId = computed(
    () => this.id() ?? this.field?.controlId ?? this.fallbackInputId,
  );

  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);

  protected readonly effectiveInvalid = computed(
    () => this.invalid() || Boolean(this.field?.invalid()),
  );

  protected readonly effectiveSize = computed<KuiComboboxSize>(() => {
    const ownSize = this.size();
    if (ownSize) return ownSize;

    const fieldSize = this.field?.size();
    return fieldSize === 'xs' ? 'sm' : (fieldSize ?? 'md');
  });

  protected readonly effectiveClearable = computed(() => {
    const own = this.clearable();
    if (own !== undefined) return own;
    if (this.fieldOpts?.clearable !== undefined) return this.fieldOpts.clearable!;
    return true;
  });

  protected readonly selectedValues = computed(() => {
    const value = this.value();
    return Array.isArray(value) ? value : value == null ? [] : [value as T];
  });

  protected readonly displayOptions = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    const options = this.options();
    if (!query || this.mode() === 'async') return options;
    return options.filter((option) => this.labelFor(option).toLocaleLowerCase().includes(query));
  });

  protected readonly activeOptionId = computed(() => {
    if (!this.open() || !this.displayOptions().length) return null;
    return `${this.listId}-option-${this.activeIndex()}`;
  });

  protected readonly showClear = computed(
    () =>
      this.effectiveClearable() &&
      !this.disabled() &&
      !this.readonly() &&
      (this.query().length > 0 || this.selectedValues().length > 0),
  );

  protected readonly inputValue = computed(() => {
    if (this.multiple()) return this.query();
    const value = this.value();
    return value == null ? this.query() : this.labelFor(value as T);
  });

  protected labelFor(option: T): string {
    return this.labelFn()?.(option) ?? String(option);
  }

  protected isSelected(option: T): boolean {
    return this.selectedValues().some((value) => value === option);
  }

  protected handleInput(event: Event): void {
    if (this.disabled() || this.readonly()) return;
    const query = (event.target as HTMLInputElement).value;
    this.query.set(query);
    if (this.mode() === 'free' && !this.multiple()) {
      this.value.set(query);
    } else if (!this.multiple()) {
      this.value.set(null);
    }
    this.openPanel();
  }

  protected handleControlClick(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;

    const target = event.target as HTMLElement;
    if (
      target.closest(
        '.kui-combobox-native, .kui-combobox-clear, .kui-combobox-chevron, .kui-chip-remove',
      )
    ) {
      return;
    }

    this.nativeInput()?.nativeElement.focus();
    this.openPanel();
  }

  protected toggleFromChevron(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled() || this.readonly()) return;

    this.nativeInput()?.nativeElement.focus();
    if (this.open()) {
      this.closePanel();
      return;
    }

    this.openPanel();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.readonly()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.openPanel();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.openPanel();
        this.moveActive(-1);
        break;
      case 'Enter':
        if (this.open()) {
          event.preventDefault();
          this.selectOption(this.displayOptions()[this.activeIndex()]);
        }
        break;
      case 'Escape':
        this.closePanel();
        break;
      case 'Backspace':
        if (this.multiple() && !this.query() && this.selectedValues().length) {
          this.removeValue(this.selectedValues()[this.selectedValues().length - 1]);
        }
        break;
    }
  }

  protected selectOption(option: T | undefined): void {
    if (option === undefined || this.disabled() || this.readonly()) return;

    if (this.multiple()) {
      const values = [...this.selectedValues()];
      const index = values.findIndex((value) => value === option);
      if (index >= 0) values.splice(index, 1);
      else values.push(option);
      this.value.set(values);
      this.query.set('');
      this.openPanel();
      return;
    }

    this.value.set(option);
    this.query.set('');
    this.closePanel();
  }

  protected removeValue(option: T): void {
    if (this.disabled()) return;
    this.value.set(this.selectedValues().filter((value) => value !== option));
  }

  protected clear(event?: MouseEvent): void {
    event?.stopPropagation();
    this.value.set(this.multiple() ? [] : null);
    this.query.set('');
    this.open.set(false);
    this.touch.emit();
  }

  protected openPanel(): void {
    if (this.disabled() || this.readonly()) return;
    this.open.set(true);
    this.activeIndex.set(
      clamp(this.activeIndex(), 0, Math.max(0, this.displayOptions().length - 1)),
    );
  }

  protected closePanel(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.touch.emit();
  }

  protected handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.nativeElement.contains(next)) {
      this.closePanel();
    }
  }

  private moveActive(delta: number): void {
    const max = this.displayOptions().length - 1;
    if (max < 0) return;
    this.activeIndex.set(clamp(this.activeIndex() + delta, 0, max));
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
