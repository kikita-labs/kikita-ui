import {
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

import { KUI_TABS_CONTEXT } from './kui-tabs-context.token';

/**
 * Tab trigger inside a `kui-tabs` container.
 * Use on `<button>` elements projected into `kui-tabs`.
 *
 * @example
 * ```html
 * <button kuiTab value="settings">Settings</button>
 * ```
 */
@Directive({
  selector: 'button[kuiTab]',
  host: {
    class: 'kui-tab',
    role: 'tab',
    type: 'button',
    '[attr.id]': 'tabId()',
    '[attr.aria-controls]': 'panelId()',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.tabindex]': 'isSelected() ? 0 : -1',
    '[attr.data-kui-selected]': 'isSelected() ? "" : null',
    '(click)': 'select()',
  },
})
export class KuiTabDirective {
  /** Value that identifies this tab. Must match the corresponding kuiTabPanel value. */
  readonly value = input<string>('');
  /** Shows a small danger dot next to the label without affecting selected state. */
  readonly hasError = input(false, { transform: booleanAttribute });
  /** Screen-reader text announced alongside the error dot. */
  readonly errorLabel = input('has error');

  private readonly context = inject(KUI_TABS_CONTEXT);
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  private errorDotEl: HTMLElement | null = null;
  private errorSrEl: HTMLElement | null = null;

  protected readonly isSelected = computed(() => this.context.selected() === this.value());
  protected readonly tabId = computed(() => this.context.tabId(this.value()));
  protected readonly panelId = computed(() =>
    this.context.controlsPanels() ? this.context.panelId(this.value()) : null,
  );

  constructor() {
    effect(() => {
      if (this.hasError()) {
        this.showErrorDot();
      } else {
        this.hideErrorDot();
      }
    });
  }

  /** @internal */
  select(): void {
    this.context.select(this.value());
  }

  /** @internal */
  focusTab(): void {
    this.elementRef.nativeElement.focus();
  }

  private showErrorDot(): void {
    const button = this.elementRef.nativeElement;

    if (!this.errorDotEl) {
      const [existingDot, ...extraDots] = Array.from(
        button.querySelectorAll<HTMLElement>(':scope > .kui-tab-error-dot'),
      );

      this.errorDotEl = existingDot ?? this.renderer.createElement('span');
      this.renderer.addClass(this.errorDotEl, 'kui-tab-error-dot');
      this.renderer.setAttribute(this.errorDotEl, 'aria-hidden', 'true');

      if (!existingDot) {
        this.renderer.appendChild(button, this.errorDotEl);
      }

      extraDots.forEach((dot) => this.renderer.removeChild(button, dot));
    }

    if (!this.errorSrEl) {
      const [existingSr, ...extraSr] = Array.from(
        button.querySelectorAll<HTMLElement>(':scope > .kui-tab-error-sr'),
      );

      this.errorSrEl = existingSr ?? this.renderer.createElement('span');
      this.renderer.addClass(this.errorSrEl, 'kui-tab-error-sr');

      if (!existingSr) {
        this.renderer.appendChild(button, this.errorSrEl);
      }

      extraSr.forEach((sr) => this.renderer.removeChild(button, sr));
    }

    this.renderer.setProperty(this.errorSrEl, 'textContent', this.errorLabel());
  }

  private hideErrorDot(): void {
    const button = this.elementRef.nativeElement;

    if (this.errorDotEl) {
      this.renderer.removeChild(button, this.errorDotEl);
      this.errorDotEl = null;
    }

    if (this.errorSrEl) {
      this.renderer.removeChild(button, this.errorSrEl);
      this.errorSrEl = null;
    }
  }
}
