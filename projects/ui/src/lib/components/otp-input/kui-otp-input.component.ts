import type { ElementRef, Signal } from '@angular/core';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import type {
  FormValueControl,
  ValidationError,
  WithOptionalFieldTree,
} from '@angular/forms/signals';
import { FormField } from '@angular/forms/signals';

import type { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { positiveIntegerAttribute } from '../../utils/kui-input-transform.util';
import { KuiFieldComponent } from '../field';
import { KuiInputDirective } from '../input';
import { KuiLoaderDirective } from '../loader';

let nextOtpInputId = 0;

const INTEGER_CHAR = /^[0-9]$/;
const ALPHANUMERIC_CHAR = /^[a-zA-Z0-9]$/;

/**
 * Row of single-character cells for entering a one-time verification code (SMS/email/
 * authenticator) or a PIN.
 *
 * Each cell renders as a real `input[kuiInput]` inside the component's own template, so it keeps
 * the kit's native input styling (border, background, focus ring, invalid/disabled) unmodified --
 * only cell layout (square size, centered digit) is overridden. `kui-otp-input` itself owns
 * roving keyboard navigation, paste distribution across cells, and coordinated value state, which
 * is why it is a composite component rather than N independently placed `input[kuiInput]`
 * elements.
 *
 * Implements {@link FormValueControl} for Signal Forms integration via `[formField]` on
 * `kui-otp-input` itself (it is not a native element, so `[formField]` goes there, not on
 * `kui-field` -- the same pattern `kui-segmented` uses). For standalone use, bind `[(value)]`
 * directly.
 *
 * `value` is the joined string of per-cell characters in cell order. Clearing a cell that has
 * later cells still filled collapses those positions when joined -- accepted, spec-inherited
 * behavior, not a defect.
 *
 * @example
 * ```html
 * <kui-otp-input [(value)]="code" (complete)="verify($event)" autoFocus />
 * ```
 *
 * @example Inside a field, with Signal Forms
 * ```html
 * <kui-field label="Code from email" hint="We sent a 6-digit code to your email">
 *   <kui-otp-input [formField]="signInForm.otp" />
 * </kui-field>
 * ```
 */
@Component({
  selector: 'kui-otp-input',
  imports: [KuiInputDirective, KuiLoaderDirective],
  template: `
    @for (char of cells(); track $index) {
      <input
        kuiInput
        #cellEl
        [id]="cellId($index)"
        [type]="mask() ? 'password' : 'text'"
        [attr.inputmode]="integerOnly() ? 'numeric' : 'text'"
        [attr.autocomplete]="$index === 0 ? 'one-time-code' : 'off'"
        [attr.maxlength]="1"
        [attr.aria-label]="cellLabel($index)"
        class="kui-otp-input__cell"
        [size]="effectiveSize()"
        [invalid]="effectiveInvalid()"
        [disabled]="disabled() || loading()"
        [readOnly]="readOnly()"
        [value]="char"
        (input)="onCellInput($index, $event)"
        (keydown)="onCellKeydown($index, $event)"
        (paste)="onCellPaste($event)"
        (focus)="onCellFocus($event)"
      />
    }
    @if (loading()) {
      <span
        kuiLoader
        [size]="effectiveSize()"
        class="kui-otp-input__loader"
        label="Verifying code"
      ></span>
    }
  `,
  host: {
    class: 'kui-otp-input',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-alpha]': 'integerOnly() ? null : ""',
    '[attr.data-kui-invalid]': 'effectiveInvalid() ? "" : null',
    '[attr.data-kui-disabled]': 'disabled() ? "" : null',
    '[attr.data-kui-loading]': 'loading() ? "" : null',
  },
  encapsulation: ViewEncapsulation.None,
})
/** Row of single-character cells for a one-time verification code or PIN. See the class-level example above. */
export class KuiOtpInputComponent implements FormValueControl<string> {
  /** Number of cells. Defaults to `6`, the most common SMS/email code length. */
  readonly length = input(6, { transform: positiveIntegerAttribute });

  /** Control size. Defaults to md. */
  readonly size = input<KuiSize | undefined>();

  /** Hides entered characters, rendering each cell as `type="password"`. Defaults to `false`. */
  readonly mask = input(false, { transform: booleanAttribute });

  /**
   * Restricts input to digits and switches to a numeric keyboard on mobile. Set to `false` for
   * letter-and-digit codes (e.g. backup/recovery codes), which are also uppercased. Defaults to
   * `true`.
   */
  readonly integerOnly = input(true, { transform: booleanAttribute });

  /** Focuses the first cell after the component mounts. Defaults to `false`. */
  readonly autoFocus = input(false, { transform: booleanAttribute });

  /** Accessible label for the cell group. Defaults to `'Verification code'`. */
  readonly ariaLabel = input('Verification code');

  /** Current code value: the joined characters of every cell, in order. */
  readonly value = model<string>('');

  /** Disables every cell. Set by `[formField]` or directly. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Whether every cell is read-only. Defaults to `false`. */
  readonly readOnly = input(false, { transform: booleanAttribute });

  /**
   * Disables every cell (like `disabled`) while an asynchronous code check is pending, blurs the
   * entered code (still visible, just softened) instead of hiding it, and shows a `Loader`
   * centered over the group -- which never changes the group's own size, unlike putting the
   * `Loader` beside it. Defaults to `false`.
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Whether the control has validation errors. Set by `[formField]` or directly. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** Current validation errors. Set by `[formField]`. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);

  /** Whether the control has been touched. Set by `[formField]`. */
  readonly touched = input(false);

  /** Emitted after any cell edits; marks the control as touched in the form system. */
  readonly touch = output<void>();

  /** Emitted exactly once when every cell becomes filled, with the completed value. */
  readonly complete = output<string>();

  private readonly instanceId = `kui-otp-input-${nextOtpInputId++}`;

  private readonly chars = signal<string[]>([]);

  private readonly cellRefs = viewChildren<ElementRef<HTMLInputElement>>('cellEl');

  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  /**
   * Ancestor `kui-field`, if any. Deliberately injected without `host: true`: `kui-otp-input` is
   * the field's directly-projected child (its own host element sits right inside `<kui-field>` in
   * the render tree), the same relationship a plain `input[kuiInput]` has with its own field --
   * only the *cells* rendered inside this component's own template are one level further in and
   * intentionally cannot see past this component's own boundary, so they never duplicate this
   * wiring.
   */
  private readonly field = inject(KuiFieldComponent, { optional: true });

  /**
   * Whether an Angular Signal Forms `[formField]` is bound directly to this component (`self:
   * true`, since `[formField]` sits on `kui-otp-input`'s own host element, not a descendant).
   * Signal Forms writes its raw, untouched-gated validity straight into the `invalid` input
   * required by `FormValueControl` -- the same "native-control interop" behavior documented on
   * `KuiInputDirective.invalid` -- so a bound `[formField]` needs its own `touched()` applied
   * before it drives any visual state, exactly like `kui-field`'s own gated `invalid()` does for
   * its error text. Manual, non-forms usage (`[invalid]="true"` with no `[formField]`) has no such
   * raw/gated split and must keep showing immediately, so this flag decides which of the two
   * `invalid` means.
   */
  private readonly hasSignalFormField = !!inject(FormField, { optional: true, self: true });

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');

  /** Forwards the ancestor `kui-field`'s hint/error ids so screen readers announce them for the group. */
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);

  /**
   * `invalid()` resolved for display, matching `KuiInputDirective.invalid`'s exact three-way
   * shape: a bound `[formField]` gates the raw Signal Forms value by `touched()`; otherwise the
   * manual `invalid()` input is OR'd with the ambient `kui-field`'s own `invalid()` -- so wrapping
   * in `<kui-field error="...">` alone already marks every cell invalid, the same as it already
   * does for a plain `input[kuiInput]`, with no separate manual `[invalid]` required on
   * `kui-otp-input` itself.
   */
  protected readonly effectiveInvalid = computed(() =>
    this.hasSignalFormField
      ? this.invalid() && this.touched()
      : this.invalid() || Boolean(this.field?.invalid()),
  );

  /** Per-cell characters, always `length()` entries long, `''` where a cell is empty. */
  protected readonly cells: Signal<string[]> = this.chars.asReadonly();

  private readonly isComplete = computed(
    () => this.chars().length === this.length() && this.chars().every((char) => char !== ''),
  );

  constructor() {
    // Reseeds the internal per-cell state from an externally set `value` (initial `[formField]`
    // value, a programmatic `[(value)]` write, or a `length` change) without looping: a commit
    // below always sets `value` to exactly `chars().join('')`, so the reseed condition is already
    // false by the time this effect re-runs after that write.
    effect(() => {
      const length = this.length();
      const value = this.value();
      const current = this.chars();

      if (current.length !== length || current.join('') !== value) {
        this.chars.set(Array.from({ length }, (_, i) => value[i] ?? ''));
      }
    });

    afterNextRender(() => {
      if (this.autoFocus()) this.focusCell(0);
    });
  }

  /**
   * The first cell adopts the ancestor `kui-field`'s `controlId`, the same automatic id a plain
   * `input[kuiInput]` takes on (`KuiInputDirective.hostId`) -- `kui-field`'s `<label for>` targets
   * exactly that id, so clicking the label now focuses (and selects) the first cell, the same way
   * it already does for a single native input. Unlike `kui-segmented` (no single cell is the
   * obvious "start here" target across N equal buttons), OTP's first cell is a natural match.
   */
  protected cellId(i: number): string {
    if (i === 0 && this.field) return this.field.controlId;
    return `${this.instanceId}-${i}`;
  }

  protected cellLabel(i: number): string {
    return `Digit ${i + 1} of ${this.length()}`;
  }

  protected onCellFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  protected onCellInput(i: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    let char = target.value.slice(-1);

    if (char) {
      const allowed = this.integerOnly() ? INTEGER_CHAR : ALPHANUMERIC_CHAR;
      if (!allowed.test(char)) {
        target.value = this.chars()[i] ?? '';
        return;
      }
      if (!this.integerOnly()) char = char.toUpperCase();
    }

    const next = this.chars().slice();
    next[i] = char;
    this.commit(next);

    if (char && i < this.length() - 1) this.focusCell(i + 1);
  }

  protected onCellKeydown(i: number, event: KeyboardEvent): void {
    switch (event.key) {
      case 'Backspace':
        // Native `readonly` only blocks the browser's own default edit for the focused cell's own
        // keystroke -- it does not stop this handler from reaching into and mutating a *different*
        // (previous) cell, so that cross-cell write needs its own explicit readOnly guard.
        if (!this.chars()[i] && i > 0 && !this.readOnly()) {
          event.preventDefault();
          const next = this.chars().slice();
          next[i - 1] = '';
          this.commit(next);
          this.focusCell(i - 1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusCell(Math.max(0, i - 1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusCell(Math.min(this.length() - 1, i + 1));
        break;
      case 'Home':
        event.preventDefault();
        this.focusCell(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusCell(this.length() - 1);
        break;
    }
  }

  protected onCellPaste(event: ClipboardEvent): void {
    event.preventDefault();
    // Unlike keyboard typing, the browser does not itself block a paste's default action on a
    // `readonly` input before this handler runs -- `readOnly()` must be checked explicitly here,
    // the same way it is for the Backspace cross-cell write above. `disabled()`/`loading()` cells
    // never reach this handler at all: the native `disabled` attribute suppresses paste natively.
    if (this.readOnly()) return;

    const raw = event.clipboardData?.getData('text') ?? '';
    const allowedOut = this.integerOnly() ? /[^0-9]/g : /[^a-zA-Z0-9]/g;
    let cleaned = raw.replace(/\s+/g, '').replace(allowedOut, '');
    if (!this.integerOnly()) cleaned = cleaned.toUpperCase();

    const text = cleaned.slice(0, this.length());
    if (!text) return;

    const next = Array.from({ length: this.length() }, (_, i) => text[i] ?? '');
    this.commit(next);
    this.focusCell(Math.min(text.length, this.length() - 1));
  }

  private commit(next: string[]): void {
    const wasComplete = this.isComplete();
    this.chars.set(next);

    const joined = next.join('');
    if (this.value() !== joined) this.value.set(joined);
    this.touch.emit();

    if (!wasComplete && this.isComplete()) this.complete.emit(joined);
  }

  private focusCell(i: number): void {
    this.cellRefs()[i]?.nativeElement.focus();
  }
}
