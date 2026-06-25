import {
  ChangeDetectionStrategy,
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
  viewChild,
} from '@angular/core';

import { KUI_OPTION_CONTEXT, KuiOptionContext } from '../dropdown/kui-option-context.token';
import { KuiDropdownComponent } from '../dropdown/kui-dropdown.component';
import { KuiSize } from '../../types';

let nextFieldId = 0;

/** Wraps a form control with Kikita UI label, hint, error, and required state semantics. */
@Component({
  selector: 'kui-field',
  templateUrl: './kui-field.component.html',
  styleUrl: './kui-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: KUI_OPTION_CONTEXT, useExisting: KuiFieldComponent }],
  host: {
    class: 'kui-field',
    '[attr.data-kui-size]': 'size()',
    '[attr.data-kui-invalid]': 'invalid() ? "" : null',
    '[attr.data-dropdown-open]': 'dropdownOpen() ? "" : null',
    '(click)': 'handleClick()',
  },
})
export class KuiFieldComponent implements KuiOptionContext {
  /** Field size — adjusts control slot height and spacing. Defaults to md. */
  readonly size = input<KuiSize>('md');

  /** Visible field label. */
  readonly label = input<string | undefined>();

  /** Optional hint text rendered below the control. */
  readonly hint = input<string | undefined>();

  /** Optional error text rendered below the control and announced through ARIA. */
  readonly error = input<string | undefined>();

  /** Marks the field label as required. */
  readonly required = input(false, { transform: booleanAttribute });

  /** Stable id used by descendant controls for label association. */
  readonly controlId = `kui-field-${nextFieldId++}`;

  /** Stable id for hint text. */
  readonly hintId = `${this.controlId}-hint`;

  /** Stable id for error text. */
  readonly errorId = `${this.controlId}-error`;

  /** Whether the field currently has an error. */
  readonly invalid = computed(() => Boolean(this.error()));

  /** Space-separated ids that describe the descendant control. */
  readonly describedBy = computed(() => {
    const ids: string[] = [];

    if (this.hint()) {
      ids.push(this.hintId);
    }

    if (this.error()) {
      ids.push(this.errorId);
    }

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly dropdown = contentChild(KuiDropdownComponent);
  protected readonly dropdownOpen = computed(() => this.dropdown()?.isOpen() ?? false);

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly controlSlot = viewChild<ElementRef<HTMLElement>>('controlSlot');
  private readonly _selectCtx = signal<KuiOptionContext | null>(null);
  private readonly _selectDisabled = signal(false);

  constructor() {
    effect(() => {
      const dropdown = this.dropdown();
      const control = this.controlSlot();
      if (dropdown && control) {
        dropdown.setAnchor(control.nativeElement, this.hostEl.nativeElement);
      }
    });
  }

  // KuiOptionContext — delegates to registered select directive
  readonly isSelected = (value: unknown): Signal<boolean> | boolean =>
    this._selectCtx()?.isSelected(value) ?? false;

  readonly select = (value: unknown): void => this._selectCtx()?.select(value);

  readonly close = (): void => this.dropdown()?.close();

  registerSelectContext(ctx: KuiOptionContext | null): void {
    this._selectCtx.set(ctx);
  }

  setSelectDisabled(disabled: boolean): void {
    this._selectDisabled.set(disabled);
  }

  getDropdown(): KuiDropdownComponent | undefined {
    return this.dropdown();
  }

  protected handleClick(): void {
    if (this._selectDisabled()) return;
    this.dropdown()?.toggle();
  }
}
