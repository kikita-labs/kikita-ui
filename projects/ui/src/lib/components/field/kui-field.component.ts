import type { Signal, TemplateRef } from '@angular/core';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';

import { KUI_FIELD_OPTIONS } from '../../tokens/kui-field-options.token';
import type { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KuiDropdownComponent } from '../dropdown/kui-dropdown.component';
import type { KuiOptionContext } from '../dropdown/kui-option-context.token';
import { KUI_OPTION_CONTEXT } from '../dropdown/kui-option-context.token';
import {
  KuiErrorDirective,
  KuiHintDirective,
  KuiLabelDirective,
} from './kui-field-markers.directive';

let nextFieldId = 0;

function optionalBooleanAttribute(value: unknown): boolean | undefined {
  return value == null ? undefined : booleanAttribute(value);
}

/** Wraps a form control with Kikita UI label, hint, error, and required state semantics. */
@Component({
  selector: 'kui-field',
  templateUrl: './kui-field.component.html',
  styleUrl: './kui-field.component.css',
  providers: [{ provide: KUI_OPTION_CONTEXT, useExisting: KuiFieldComponent }],
  host: {
    class: 'kui-field',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-invalid]': 'invalid() ? "" : null',
    '[attr.data-dropdown-open]': 'dropdownOpen() ? "" : null',
    '(click)': 'handleClick($event)',
    '(keydown)': 'handleKeydown($event)',
  },
})
export class KuiFieldComponent implements KuiOptionContext {
  /** Field size, adjusting control slot height and spacing. Defaults to md. */
  readonly size = input<KuiSize | undefined>();

  /** Visible field label. */
  readonly label = input<string | undefined>();

  /** Optional hint text rendered below the control. */
  readonly hint = input<string | undefined>();

  /** Optional error text rendered below the control and announced through ARIA. */
  readonly error = input<string | undefined>();

  /** Hides rendered error messages while keeping invalid state. */
  readonly hideErrors = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /** Explicitly controls the required marker. Omit to inherit from a projected Angular Signal Forms field. */
  readonly required = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /** Stable id used by descendant controls for label association. */
  readonly controlId = `kui-field-${nextFieldId++}`;

  /** Stable id for hint text. */
  readonly hintId = `${this.controlId}-hint`;

  /** Stable id for error text. */
  readonly errorId = `${this.controlId}-error`;

  /** Error text rendered by shorthand input or inferred from a projected Angular Signal Forms field. */
  readonly displayedError = computed(() => {
    if (this.effectiveHideErrors()) return undefined;

    const explicitError = this.error();
    if (explicitError) return explicitError;

    return this.signalFormField()
      ?.state()
      .errors()
      .find((error) => error.message)?.message;
  });

  /** Whether the field currently has an error. */
  readonly invalid = computed(
    () =>
      Boolean(this.error()) ||
      Boolean(this.projectedError()) ||
      Boolean(this.signalFormField()?.state().invalid()),
  );

  /** Whether the required marker should be visible. */
  readonly isRequired = computed(
    () => this.required() ?? this.signalFormField()?.state().required() ?? false,
  );

  /** Effective field size after local input and provider defaults are applied. */
  readonly effectiveSize = computed(
    () => this.size() ?? this.fieldOpts?.size ?? this.rootDefaultSize ?? 'md',
  );

  /** Effective auto-error visibility after local input and provider defaults are applied. */
  readonly effectiveHideErrors = computed(
    () => this.hideErrors() ?? this.fieldOpts?.hideErrors ?? false,
  );

  /** Space-separated ids that describe the descendant control. */
  readonly describedBy = computed(() => {
    const ids: string[] = [];

    const projectedHintId = this.projectedHint()?.id;
    const projectedErrorId = this.projectedError()?.id;

    if (this.hint()) {
      ids.push(this.hintId);
    }

    if (projectedHintId) {
      ids.push(projectedHintId);
    }

    if (this.displayedError()) {
      ids.push(this.errorId);
    }

    if (projectedErrorId && !this.effectiveHideErrors()) {
      ids.push(projectedErrorId);
    }

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly dropdown = contentChild(KuiDropdownComponent);
  protected readonly dropdownOpen = computed(() => this.dropdown()?.isOpen() ?? false);
  protected readonly projectedLabel = contentChild(KuiLabelDirective);

  private readonly signalFormField = contentChild<FormField<unknown>>(FormField);
  private readonly projectedHint = contentChild(KuiHintDirective);
  private readonly projectedError = contentChild(KuiErrorDirective);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly fieldOpts = inject(KUI_FIELD_OPTIONS, { optional: true });
  private readonly rootDefaultSize = injectKuiRootSizeDefault();
  private readonly controlSlot = viewChild<ElementRef<HTMLElement>>('controlSlot');
  private readonly _selectCtx = signal<KuiOptionContext | null>(null);
  private readonly _selectDisabled = signal(false);
  private readonly _selectValueTemplate = signal<TemplateRef<unknown> | null>(null);

  /** @internal Custom selected-value template registered by `ng-template[kuiSelectValue]`. */
  readonly selectValueTemplate = this._selectValueTemplate.asReadonly();

  constructor() {
    effect(() => {
      const dropdown = this.dropdown();
      const control = this.controlSlot();
      if (dropdown && control) {
        dropdown.setAnchor(control.nativeElement, this.hostEl.nativeElement);
      }
    });

    effect(() => {
      this.projectedLabel()?.setFor(this.controlId);
    });
  }

  // KuiOptionContext delegates to the registered select directive.
  readonly isSelected = (value: unknown): Signal<boolean> | boolean =>
    this._selectCtx()?.isSelected(value) ?? false;

  readonly select = (value: unknown): void => this._selectCtx()?.select(value);

  readonly close = (): void => this.dropdown()?.close();

  readonly shouldCloseOnSelect = (): boolean => this._selectCtx()?.shouldCloseOnSelect?.() ?? true;

  registerSelectContext(ctx: KuiOptionContext | null): void {
    this._selectCtx.set(ctx);
  }

  setSelectDisabled(disabled: boolean): void {
    this._selectDisabled.set(disabled);
  }

  /** @internal Registers a custom selected-value template for `input[kuiSelect]`. */
  setSelectValueTemplate(template: TemplateRef<unknown> | null): void {
    this._selectValueTemplate.set(template);
  }

  getDropdown(): KuiDropdownComponent | undefined {
    return this.dropdown();
  }

  protected handleClick(event: MouseEvent): void {
    if (this._selectDisabled()) return;
    const target = event.target as Node | null;
    const control = this.controlSlot()?.nativeElement;
    if (!target || !control?.contains(target)) return;
    this.dropdown()?.toggle();
  }

  /**
   * Keyboard fallback for a manually-wired dropdown (a control without `kuiSelect`/`kuiCombobox`,
   * e.g. a plain `input[kuiInput]` with a sibling `kui-dropdown` inside `kui-field`). Those
   * directives already wire their own keydown handling; skip entirely when one is registered
   * (`_selectCtx`) to avoid double-handling the same key.
   */
  protected handleKeydown(event: KeyboardEvent): void {
    if (this._selectCtx() || this._selectDisabled()) return;
    const target = event.target as Node | null;
    const control = this.controlSlot()?.nativeElement;
    if (!target || !control?.contains(target)) return;

    const dropdown = this.dropdown();
    if (!dropdown) return;

    if (!dropdown.isOpen()) {
      if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      dropdown.open();
      this.focusOption(event.key === 'ArrowUp' ? 'last' : 'first');
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusOption('first');
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusOption('last');
        break;
      case 'Tab':
        dropdown.close();
        break;
    }
  }

  private focusOption(which: 'first' | 'last'): void {
    setTimeout(() => {
      const panel = this.dropdown()?.getPanel();
      const opts = panel?.querySelectorAll<HTMLElement>(
        '.kui-listbox-option:not(.kui-listbox-option--disabled)',
      );
      if (!opts?.length) return;
      (which === 'last' ? opts[opts.length - 1] : opts[0]).focus();
    }, 0);
  }
}
