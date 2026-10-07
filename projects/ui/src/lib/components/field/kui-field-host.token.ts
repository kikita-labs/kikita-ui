import type { TemplateRef } from '@angular/core';
import type { Signal } from '@angular/core';
import { DestroyRef, inject, InjectionToken } from '@angular/core';

import type { KuiFieldWiringSource } from '../../utils/kui-field-control-wiring.util';
import type { KuiCalendar } from '../calendar/kui-calendar';
import type { KuiDropdown } from '../dropdown/kui-dropdown';
import type { KuiTimePickerPanel } from '../time-picker/kui-time-picker-panel';
import type { KuiOptionContext } from './kui-option-context.token';

/**
 * @internal
 * Key of a part that can register itself with the ancestor `kui-field`, such as the dropdown or the
 * calendar of a picker. The type parameter is the part's instance type; it is erased at runtime, so
 * a key never makes the field import the part.
 */
export interface KuiFieldPart<T> {
  /** Name used to tell keys apart in diagnostics. */
  readonly name: string;

  /** Phantom member that carries the instance type. It is never set. */
  readonly instanceType?: T;
}

/** @internal The `kui-dropdown` projected into a field. */
export const KUI_FIELD_DROPDOWN: KuiFieldPart<KuiDropdown> = { name: 'dropdown' };

/** @internal The `kui-calendar` projected into a field, wired by `input[kuiDatePicker]`. */
export const KUI_FIELD_CALENDAR: KuiFieldPart<KuiCalendar> = { name: 'calendar' };

/** @internal The `kui-time-picker-panel` projected into a field, wired by `input[kuiTimePicker]`. */
export const KUI_FIELD_TIME_PICKER_PANEL: KuiFieldPart<KuiTimePickerPanel> = {
  name: 'time-picker-panel',
};

/**
 * @internal
 * What a control or a part reads from and registers with its ancestor `kui-field`. Controls inject
 * this contract through {@link KUI_FIELD}, never the `KuiField` class, so using a control
 * does not pull the field or the parts it can host into a bundle.
 */
export interface KuiFieldHost extends KuiFieldWiringSource {
  /** Whether the required marker is visible. */
  readonly isRequired: Signal<boolean>;

  /** Custom selected-value template registered by `ng-template[kuiSelectValue]`. */
  readonly selectValueTemplate: Signal<TemplateRef<unknown> | null>;

  /** Registers a part and returns the function that unregisters it. */
  registerPart<T>(part: KuiFieldPart<T>, instance: T): () => void;

  /** The first registered instance of a part, or `undefined`. */
  getPart<T>(part: KuiFieldPart<T>): T | undefined;

  /** The `kui-dropdown` registered with the field, if any. */
  getDropdown(): KuiDropdown | undefined;

  /** The `kui-calendar` registered with the field, if any. */
  getCalendar(): KuiCalendar | undefined;

  /** The `kui-time-picker-panel` registered with the field, if any. */
  getTimePickerPanel(): KuiTimePickerPanel | undefined;

  /** Registers the select-like control that owns the field's options. */
  registerSelectContext(context: KuiOptionContext | null): void;

  /** Tells the field that the registered select is disabled. */
  setSelectDisabled(disabled: boolean): void;

  /** Registers a custom selected-value template. */
  setSelectValueTemplate(template: TemplateRef<unknown> | null): void;
}

/** @internal Injection token of the ancestor `kui-field`, typed as its contract. */
export const KUI_FIELD = new InjectionToken<KuiFieldHost>('KUI_FIELD');

/**
 * @internal
 * Registers a part with the ancestor `kui-field` for the lifetime of the calling injection context.
 * Does nothing outside a field. Call it from a constructor or a field initialiser.
 */
export function registerKuiFieldPart<T>(part: KuiFieldPart<T>, instance: T): void {
  const field = inject(KUI_FIELD, { optional: true });

  if (field) {
    inject(DestroyRef).onDestroy(field.registerPart(part, instance));
  }
}
