import { Service } from '@angular/core';

/**
 * @internal
 * Generates control IDs from application-scoped state so separate SSR renders do not share a
 * module-level counter.
 */
@Service()
export class KuiFieldIdGenerator {
  private nextId = 0;

  /** Generates the next Field control ID for the current Angular application. */
  nextControlId(): string {
    return `kui-field-${this.nextId++}`;
  }
}
