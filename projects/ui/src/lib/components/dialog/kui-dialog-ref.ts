import { Subject } from 'rxjs';

import type { Observable } from 'rxjs';

/**
 * Handle returned by {@link KuiDialogService.open}.
 * Use {@link afterClosed} to react to the dialog result.
 */
export class KuiDialogRef<TResult = void> {
  private readonly subject = new Subject<TResult | undefined>();

  /** Observable that emits once when the dialog closes, then completes. */
  afterClosed(): Observable<TResult | undefined> {
    return this.subject.asObservable();
  }

  /** @internal Called by the container after the close animation finishes. */
  _complete(result?: TResult): void {
    this.subject.next(result);
    this.subject.complete();
  }
}
