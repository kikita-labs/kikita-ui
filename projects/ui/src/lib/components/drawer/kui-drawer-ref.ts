import { Subject } from 'rxjs';

import type { Observable } from 'rxjs';

/**
 * Handle returned by {@link KuiDrawerService.open}.
 * Use {@link afterClosed} to react to the drawer result.
 */
export class KuiDrawerRef<TResult = void> {
  private readonly subject = new Subject<TResult | undefined>();

  /** Observable that emits once when the drawer closes, then completes. */
  afterClosed(): Observable<TResult | undefined> {
    return this.subject.asObservable();
  }

  /** @internal Called by the container after the close animation finishes. */
  _complete(result?: TResult): void {
    this.subject.next(result);
    this.subject.complete();
  }
}
