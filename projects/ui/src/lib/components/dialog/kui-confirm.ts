import { inject } from '@angular/core';
import { map, type Observable } from 'rxjs';

import { KuiDialogService } from './kui-dialog.service';
import { KuiConfirmComponent } from './kui-confirm.component';
import type { KuiConfirmConfig } from './kui-confirm.types';

/**
 * Returns a function that opens a pre-built confirmation dialog.
 * Must be called in an injection context (component/directive constructor or field initializer).
 *
 * @example
 * ```typescript
 * private readonly confirm = kuiConfirm();
 *
 * protected delete(): void {
 *   this.confirm({ title: 'Удалить?', appearance: 'danger', confirmLabel: 'Удалить' })
 *     .subscribe(ok => { if (ok) { ... } });
 * }
 * ```
 */
export function kuiConfirm(): (config: KuiConfirmConfig) => Observable<boolean> {
  const service = inject(KuiDialogService);
  return (config: KuiConfirmConfig): Observable<boolean> =>
    service
      .open(KuiConfirmComponent, {
        data: config,
        size: 'sm',
        appearance: config.appearance ?? 'default',
        dismissable: false,
        closable: false,
      })
      .pipe(map((result) => result ?? false));
}
