import { inject } from '@angular/core';

import { map, type Observable } from 'rxjs';

import type { KuiConfirmConfig } from './kui-confirm.types';
import { KuiConfirmDialog } from './kui-confirm-dialog';
import { KuiDialog } from './kui-dialog';

/**
 * Returns a function that opens a pre-built confirmation dialog.
 * Must be called in an injection context (component/directive constructor or field initializer).
 *
 * @example
 * ```typescript
 * private readonly confirm = kuiConfirm();
 *
 * protected delete(): void {
 *   this.confirm({ title: 'Delete?', appearance: 'danger', confirmLabel: 'Delete' })
 *     .subscribe(ok => { if (ok) { ... } });
 * }
 * ```
 */
export function kuiConfirm(): (config: KuiConfirmConfig) => Observable<boolean> {
  const service = inject(KuiDialog);
  return (config: KuiConfirmConfig): Observable<boolean> =>
    service
      .open(KuiConfirmDialog, {
        data: config,
        size: 'sm',
        appearance: config.appearance ?? 'default',
        dismissable: false,
        closable: false,
      })
      .pipe(map((result) => result ?? false));
}
