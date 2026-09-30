import { Directive, ElementRef, inject } from '@angular/core';

import { kuiIdFactory } from '../../utils/kui-id.util';

function ensureElementId(
  element: HTMLElement,
  prefix: string,
  nextId: (prefix: string) => string,
): string {
  if (!element.id) {
    element.id = nextId(prefix);
  }

  return element.id;
}

/** Marks projected content as the label for a `kui-field`. */
@Directive({
  selector: '[kuiLabel]',
  host: {
    class: 'kui-field__label',
  },
})
export class KuiLabelDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly nextId = kuiIdFactory();

  /** @internal */
  readonly id = ensureElementId(this.elementRef.nativeElement, 'kui-field-label', this.nextId);

  /** @internal */
  setFor(controlId: string): void {
    const element = this.elementRef.nativeElement;
    if (element.tagName.toLowerCase() === 'label') {
      element.setAttribute('for', controlId);
    }
  }
}

/** Marks projected content as hint text for a `kui-field`. */
@Directive({
  selector: '[kuiHint]',
  host: {
    class: 'kui-field__hint',
  },
})
export class KuiHintDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly nextId = kuiIdFactory();

  /** Stable id used by `kui-field` for `aria-describedby`. */
  readonly id = ensureElementId(this.elementRef.nativeElement, 'kui-field-hint', this.nextId);
}

/** Marks projected content as error text for a `kui-field`. */
@Directive({
  selector: '[kuiError]',
  host: {
    class: 'kui-field__error',
    role: 'alert',
  },
})
export class KuiErrorDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly nextId = kuiIdFactory();

  /** Stable id used by `kui-field` for `aria-describedby`. */
  readonly id = ensureElementId(this.elementRef.nativeElement, 'kui-field-error', this.nextId);
}
