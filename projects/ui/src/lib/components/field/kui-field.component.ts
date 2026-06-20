import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

let nextFieldId = 0;

/** Wraps a form control with Kikita UI label, hint, error, and required state semantics. */
@Component({
  selector: 'kui-field',
  templateUrl: './kui-field.component.html',
  styleUrl: './kui-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'kui-field',
    '[attr.data-kui-invalid]': 'invalid() ? "" : null',
  },
})
export class KuiFieldComponent {
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
}
