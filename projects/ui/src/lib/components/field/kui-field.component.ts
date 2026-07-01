import {
  Component,
  ElementRef,
  Signal,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';

import { KUI_OPTION_CONTEXT, KuiOptionContext } from '../dropdown/kui-option-context.token';
import { KuiDropdownComponent } from '../dropdown/kui-dropdown.component';
import { KUI_FIELD_OPTIONS } from '../../tokens/kui-field-options.token';
import { KuiSize } from '../../types';
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
    '(click)': 'handleClick()',
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

  /** Hides automatically rendered Angular Signal Forms error messages. */
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
    const explicitError = this.error();
    if (explicitError) return explicitError;
    if (this.effectiveHideErrors()) return undefined;

    return this.signalFormField()
      ?.state()
      .errors()
      .find((error) => error.message)?.message;
  });

  /** Whether the field currently has an error. */
  readonly invalid = computed(
    () =>
      Boolean(this.displayedError()) ||
      Boolean(this.projectedError()) ||
      Boolean(this.signalFormField()?.state().invalid()),
  );

  /** Whether the required marker should be visible. */
  readonly isRequired = computed(
    () => this.required() ?? this.signalFormField()?.state().required() ?? false,
  );

  /** Effective field size after local input and provider defaults are applied. */
  readonly effectiveSize = computed(() => this.size() ?? this.fieldOpts?.size ?? 'md');

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

    if (projectedErrorId) {
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
  private readonly controlSlot = viewChild<ElementRef<HTMLElement>>('controlSlot');
  private readonly _selectCtx = signal<KuiOptionContext | null>(null);
  private readonly _selectDisabled = signal(false);
  private readonly _selectValueTemplate = signal<TemplateRef<unknown> | null>(null);
  private readonly _comboboxValueTemplate = signal<TemplateRef<unknown> | null>(null);

  /** @internal Custom selected-value template registered by `ng-template[kuiSelectValue]`. */
  readonly selectValueTemplate = this._selectValueTemplate.asReadonly();

  /** @internal Custom selected-value template registered by `ng-template[kuiComboboxValue]`. */
  readonly comboboxValueTemplate = this._comboboxValueTemplate.asReadonly();

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

  /** @internal Registers a custom selected-value template for `kui-combobox`. */
  setComboboxValueTemplate(template: TemplateRef<unknown> | null): void {
    this._comboboxValueTemplate.set(template);
  }

  getDropdown(): KuiDropdownComponent | undefined {
    return this.dropdown();
  }

  protected handleClick(): void {
    if (this._selectDisabled()) return;
    this.dropdown()?.toggle();
  }
}
