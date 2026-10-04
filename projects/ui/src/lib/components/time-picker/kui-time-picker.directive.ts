import type { ComponentRef, OnDestroy } from '@angular/core';
import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import type {
  FormValueControl,
  ValidationError,
  WithOptionalFieldTree,
} from '@angular/forms/signals';

import { sameNullableDate } from '../../foundation/date/kui-date-equality.util';
import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiI18n } from '../../i18n/kui-i18n.service';
import type { KuiTimePickerMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { createKuiFieldWiring } from '../../utils/kui-field-control-wiring.util';
import {
  optionalBooleanAttribute,
  optionalPositiveIntegerAttribute,
} from '../../utils/kui-input-transform.util';
import { KUI_FIELD } from '../field/kui-field-host.token';
import {
  autoMaskTimeInputText,
  formatDisplayTime,
  maxTimeInputLength,
  parseDisplayTime,
} from './kui-time-format.util';
import type { KuiTimePickerFormat } from './kui-time-picker.types';
import { KuiTimePickerInputAffix } from './kui-time-picker-input-affix.component';

/**
 * Converts a native text input into a time-of-day picker trigger. Text is parsed/formatted per
 * `format` (`HH:mm[:ss]` for `'24h'`, `hh:mm[:ss] AM/PM` for `'12h'`); pair it with
 * `kui-time-picker-panel` inside a sibling `kui-dropdown` for the scrollable hour/minute/second
 * column popover -- the same composition `input[kuiDatePicker]` uses with `kui-calendar`.
 *
 * When a `kui-time-picker-panel` is found as a sibling inside the same `kui-field` (via
 * `KuiField.getTimePickerPanel()`), the directive auto-wires it: its own `value`,
 * `format`, `minuteStep`, `secondStep`, and `showSeconds` are pushed into the panel -- no manual
 * `[value]`/`(valueChange)` or `[format]`/`[minuteStep]`/`[secondStep]`/`[showSeconds]` binding is
 * required on the panel for this to work. `value` also flows back from the panel (a cell click,
 * an arrow-key move, "Now") the same way `kui-calendar`'s day picks flow back into
 * `input[kuiDatePicker]`.
 *
 * @example
 * ```html
 * <kui-field label="Time">
 *   <input kuiTimePicker [(value)]="time" />
 *   <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="280px">
 *     <kui-time-picker-panel />
 *   </kui-dropdown>
 * </kui-field>
 * ```
 */
@Directive({
  selector: 'input[kuiTimePicker]',
  host: {
    class: 'kui-input kui-timepicker-input',
    role: 'combobox',
    autocomplete: 'off',
    'aria-haspopup': 'dialog',
    '[attr.id]': 'hostId()',
    '[attr.aria-expanded]': 'dropdownOpen()',
    '[attr.aria-controls]': 'dropdownPanelId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-required]': 'ariaRequired()',
    '[attr.aria-invalid]': 'effectiveInvalid() ? "true" : null',
    '[attr.data-kui-invalid]': 'effectiveInvalid() ? "" : null',
    '[attr.placeholder]': 'effectivePlaceholder()',
    '[attr.maxlength]': 'effectiveMaxLength()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.readonly]': 'readonly() ? "" : null',
    '[attr.data-has-clear]': 'showClear() ? "" : null',
    '(pointerdown)': 'handlePointerdown()',
    '(click)': 'handleClick($event)',
    '(input)': 'handleInput($event)',
    '(keydown)': 'handleKeydown($event)',
  },
})
/** Adds a scrollable-column time picker behavior to a native input. */
export class KuiTimePicker implements OnDestroy, FormValueControl<Date | null> {
  /**
   * Selected time. Bound by `[formField]` or `[(value)]`. Auto-wired (both ways) into a sibling
   * `kui-time-picker-panel` inside the same `kui-field` (see the class doc).
   */
  readonly value = model<Date | null>(null);

  /** Display/parse format. Auto-wired (push-only) into a sibling `kui-time-picker-panel`. */
  readonly format = input<KuiTimePickerFormat | undefined>();
  /**
   * Hour column step. Not in the Claude Design spec's own API table (which only lists
   * `minuteStep`/`secondStep`), added for naming/behavior parity with those two. Auto-wired
   * (push-only) into a sibling `kui-time-picker-panel`.
   */
  readonly hourStep = input<number | undefined, unknown>(undefined, {
    transform: optionalPositiveIntegerAttribute,
  });
  /** Minute column step. Auto-wired (push-only) into a sibling `kui-time-picker-panel`. */
  readonly minuteStep = input<number | undefined, unknown>(undefined, {
    transform: optionalPositiveIntegerAttribute,
  });
  /** Second column step, used only when `showSeconds` is true. Auto-wired (push-only). */
  readonly secondStep = input<number | undefined, unknown>(undefined, {
    transform: optionalPositiveIntegerAttribute,
  });
  /** Shows a seconds column/field. Defaults to false. Auto-wired (push-only). */
  readonly showSeconds = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });
  /**
   * Earliest selectable time-of-day (inclusive; only the hours/minutes/seconds fields are read).
   * Typing/selecting an earlier time is invalid, the same convention `kuiDatePicker`'s `minDate`
   * uses. Auto-wired (push-only) into a sibling `kui-time-picker-panel`, which disables every
   * wheel cell outside the range.
   */
  readonly minTime = input<Date | undefined>(undefined);
  /** Latest selectable time-of-day (inclusive). See {@link minTime}. */
  readonly maxTime = input<Date | undefined>(undefined);
  /**
   * Returns the hours to disable, called with no arguments. For a rule that doesn't reduce to a
   * single `[minTime, maxTime]` range -- e.g. "disable the first 30 minutes of every hour" -- see
   * {@link disabledMinutes}. Disables the matching wheel cells and marks a typed/selected value
   * landing on one `aria-invalid`, the same treatment `minTime`/`maxTime` get. Auto-wired
   * (push-only).
   */
  readonly disabledHours = input<(() => readonly number[]) | undefined>(undefined);
  /** Returns the minutes to disable for a given `hour`. See {@link disabledHours}. */
  readonly disabledMinutes = input<((hour: number) => readonly number[]) | undefined>(undefined);
  /** Returns the seconds to disable for a given `hour`/`minute`, used only when `showSeconds` is true. See {@link disabledHours}. */
  readonly disabledSeconds = input<
    ((hour: number, minute: number) => readonly number[]) | undefined
  >(undefined);

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

  /** Placeholder text shown when the field is empty. Defaults to a format-appropriate mask. */
  readonly placeholder = input<string | undefined>(undefined);
  /** Per-instance text overrides; they win over the scoped and root messages. */
  readonly messages = input<Partial<KuiTimePickerMessages> | undefined>(undefined);
  /** Shows a clear button when the picker has a value. */
  readonly clearable = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly field = inject(KUI_FIELD, { optional: true });
  private readonly fieldDefaults = inject(KuiDefaults).get('field');
  private readonly timePickerDefaults = inject(KuiDefaults).get('timePicker');

  private readonly i18n = inject(KuiI18n);
  protected readonly t = injectKuiMessages('timePicker', () => this.messages());
  private readonly layout = computed(() => this.i18n.timePattern(this.i18n.locale()));

  protected readonly effectiveFormat = computed(
    () =>
      this.format() ??
      this.timePickerDefaults()?.format ??
      (this.layout().hourCycle12 ? '12h' : '24h'),
  );
  protected readonly effectiveHourStep = computed(
    () => this.hourStep() ?? this.timePickerDefaults()?.hourStep ?? 1,
  );
  protected readonly effectiveMinuteStep = computed(
    () => this.minuteStep() ?? this.timePickerDefaults()?.minuteStep ?? 1,
  );
  protected readonly effectiveSecondStep = computed(
    () => this.secondStep() ?? this.timePickerDefaults()?.secondStep ?? 1,
  );
  protected readonly effectiveShowSeconds = computed(
    () => this.showSeconds() ?? this.timePickerDefaults()?.showSeconds ?? false,
  );
  private readonly affixRef: ComponentRef<KuiTimePickerInputAffix>;
  private wasOpen = false;
  private pointerStartedOnInput = false;
  private readonly rawText = signal('');
  private readonly parseFailed = signal(false);

  protected readonly dropdownOpen = computed(() => this.field?.getDropdown()?.isOpen() ?? false);
  protected readonly dropdownPanelId = computed(() =>
    this.dropdownOpen() ? (this.field?.getDropdown()?.getPanelId() ?? null) : null,
  );
  private readonly wiring = createKuiFieldWiring({
    field: this.field,
    id: this.id,
    invalid: this.invalid,
  });

  protected readonly hostId = this.wiring.hostId;
  protected readonly describedBy = this.wiring.describedBy;
  protected readonly ariaRequired = this.wiring.ariaRequired;
  protected readonly hasValue = computed(() => this.value() != null || this.rawText().length > 0);
  protected readonly effectiveClearable = computed(() => {
    const own = this.clearable();
    if (own !== undefined) return own;
    if (this.timePickerDefaults()?.clearable !== undefined)
      return this.timePickerDefaults()!.clearable!;
    if (this.fieldDefaults()?.clearable !== undefined) return this.fieldDefaults()!.clearable!;
    return true;
  });
  protected readonly showClear = computed(
    () => this.effectiveClearable() && this.hasValue() && !this.disabled() && !this.readonly(),
  );
  /** Max typed length for the current `format`/`showSeconds` (e.g. `hh:mm:ss AM` = 11). */
  protected readonly effectiveMaxLength = computed(() =>
    maxTimeInputLength(this.effectiveFormat(), this.effectiveShowSeconds(), this.layout()),
  );
  protected readonly effectivePlaceholder = computed(() => {
    const own = this.placeholder();
    if (own !== undefined) return own;

    const t = this.t();
    const pattern = this.layout();
    const parts = [t.hourPlaceholder, t.minutePlaceholder];
    if (this.effectiveShowSeconds()) parts.push(t.secondPlaceholder);
    const time = parts.join(pattern.separator);
    if (this.effectiveFormat() !== '12h') return time;

    const period = `${pattern.am}/${pattern.pm}`;

    return pattern.periodBefore
      ? `${period}${pattern.periodGap}${time}`
      : `${time}${pattern.periodGap}${period}`;
  });

  /**
   * Whether `value`'s time-of-day falls outside `minTime`/`maxTime`, or is named by
   * `disabledHours`/`disabledMinutes`/`disabledSeconds` -- the same checks the panel's wheel
   * cells use, applied here too so a fully-typed value that lands on a disallowed slot is caught,
   * not just wheel-driven values. See `KuiDatePicker.outOfRange`.
   */
  private readonly outOfRange = computed(() => {
    const value = this.value();
    if (!value) return false;
    const min = this.minTime();
    const max = this.maxTime();
    const seconds = value.getHours() * 3600 + value.getMinutes() * 60 + value.getSeconds();
    if (min && seconds < min.getHours() * 3600 + min.getMinutes() * 60 + min.getSeconds()) {
      return true;
    }
    if (max && seconds > max.getHours() * 3600 + max.getMinutes() * 60 + max.getSeconds()) {
      return true;
    }
    const hour = value.getHours();
    const minute = value.getMinutes();
    if (this.disabledHours()?.().includes(hour)) return true;
    if (this.disabledMinutes()?.(hour).includes(minute)) return true;
    if (
      this.effectiveShowSeconds() &&
      this.disabledSeconds()?.(hour, minute).includes(value.getSeconds())
    ) {
      return true;
    }
    return false;
  });

  /** See `KuiDatePicker.effectiveInvalid`. */
  protected readonly effectiveInvalid = computed(
    () => this.wiring.invalid() || this.parseFailed() || this.outOfRange(),
  );

  constructor() {
    this.affixRef = this.vcr.createComponent(KuiTimePickerInputAffix);

    effect(() => {
      this.affixRef.setInput('clearable', this.effectiveClearable());
      this.affixRef.setInput('hasValue', this.hasValue());
      this.affixRef.setInput('isOpen', this.dropdownOpen());
      this.affixRef.setInput('disabled', this.disabled());
      this.affixRef.setInput('readonly', this.readonly());
      this.affixRef.setInput('messages', this.messages());
    });

    effect(() => {
      const value = this.value();
      this.parseFailed.set(false);
      this.writeNativeValue(
        value
          ? formatDisplayTime(
              value,
              this.effectiveFormat(),
              this.effectiveShowSeconds(),
              this.layout(),
            )
          : '',
      );
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

    // Auto-wire a paired `kui-time-picker-panel` found as a sibling inside the same `kui-field`
    // -- same push/pull pattern `input[kuiDatePicker]` uses for `kui-calendar` (see there for why
    // each effect only tracks its own driving side).
    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const value = this.value();
      if (!sameNullableDate(untracked(panel.value), value)) {
        panel.value.set(value);
      }
    });

    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const panelValue = panel.value();
      if (!sameNullableDate(panelValue, untracked(this.value))) {
        this.value.set(panelValue);
      }
    });

    // `format`/`minuteStep`/`secondStep`/`showSeconds` only flow one way (this directive is the
    // source of truth; the panel never changes them on its own), so push-only.
    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const format = this.effectiveFormat();
      if (untracked(panel.format) !== format) panel.format.set(format);
    });

    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const hourStep = this.effectiveHourStep();
      if (untracked(panel.hourStep) !== hourStep) panel.hourStep.set(hourStep);
    });

    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const minuteStep = this.effectiveMinuteStep();
      if (untracked(panel.minuteStep) !== minuteStep) panel.minuteStep.set(minuteStep);
    });

    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const secondStep = this.effectiveSecondStep();
      if (untracked(panel.secondStep) !== secondStep) panel.secondStep.set(secondStep);
    });

    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const showSeconds = this.effectiveShowSeconds();
      if (untracked(panel.showSeconds) !== showSeconds) panel.showSeconds.set(showSeconds);
    });

    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const min = this.minTime();
      if (untracked(panel.minTime)?.getTime() !== min?.getTime()) panel.minTime.set(min);
    });

    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const max = this.maxTime();
      if (untracked(panel.maxTime)?.getTime() !== max?.getTime()) panel.maxTime.set(max);
    });

    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const fn = this.disabledHours();
      if (untracked(panel.disabledHours) !== fn) panel.disabledHours.set(fn);
    });

    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const fn = this.disabledMinutes();
      if (untracked(panel.disabledMinutes) !== fn) panel.disabledMinutes.set(fn);
    });

    effect(() => {
      const panel = this.field?.getTimePickerPanel();
      if (!panel) return;
      const fn = this.disabledSeconds();
      if (untracked(panel.disabledSeconds) !== fn) panel.disabledSeconds.set(fn);
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

    const target = event.target as HTMLInputElement;
    // Auto-inserts `:` as digits are typed (and strips anything that could never be part of a
    // valid value -- stray/pasted/mashed-keyboard text, including non-Latin characters, never
    // piles up in the field either way).
    const text = autoMaskTimeInputText(
      target.value,
      this.effectiveFormat(),
      this.effectiveShowSeconds(),
      this.layout(),
    );
    if (target.value !== text) target.value = text;

    this.rawText.set(text);
    const parsed = parseDisplayTime(
      text,
      this.effectiveFormat(),
      this.effectiveShowSeconds(),
      this.value() ?? new Date(),
      this.layout(),
      this.effectiveHourStep(),
      this.effectiveMinuteStep(),
      this.effectiveSecondStep(),
    );

    if (parsed) {
      this.parseFailed.set(false);
      this.value.set(parsed);
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
          this.focusFirstColumn();
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
   * Moves DOM focus from the text input into the open panel's first unit column, so a second
   * ArrowDown starts column navigation instead of doing nothing -- same rationale as
   * `KuiDatePicker.focusCalendarGrid`.
   */
  private focusFirstColumn(): void {
    this.field
      ?.getDropdown()
      ?.getPanel()
      ?.querySelector<HTMLElement>('.kui-timepicker-col')
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
