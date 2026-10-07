import { inject, Service } from '@angular/core';

/**
 * @internal
 * Application-scoped id sequences, one per prefix.
 *
 * A module-level counter is shared by every server render in the same Node process, so server ids
 * keep growing across requests and never match the ids the browser generates when it starts from
 * zero. Keeping the sequences in an application-scoped service makes each render, and each browser
 * session, count from the same start in the same creation order.
 */
@Service()
export class KuiIdSequences {
  private readonly counters = new Map<string, number>();

  /**
   * Returns `${prefix}-${n}` for the next `n` of this prefix in the current application.
   *
   * @param prefix Id prefix, for example `kui-carousel`.
   * @param first Number of the first id of the prefix, kept configurable so ids that historically
   *   started at 1 keep their format.
   */
  next(prefix: string, first = 0): string {
    const value = this.counters.get(prefix) ?? first;

    this.counters.set(prefix, value + 1);

    return `${prefix}-${value}`;
  }
}

/**
 * @internal
 * Returns the next application-scoped id for `prefix`. Call it from an injection context, such as a
 * field initializer.
 */
export function kuiNextId(prefix: string, first = 0): string {
  return inject(KuiIdSequences).next(prefix, first);
}

/**
 * @internal
 * Returns an id factory bound to the current application, for classes that create ids later in
 * event handlers or lifecycle methods. Call it from an injection context.
 */
export function kuiIdFactory(): (prefix: string, first?: number) => string {
  const sequences = inject(KuiIdSequences);

  return (prefix, first = 0) => sequences.next(prefix, first);
}
