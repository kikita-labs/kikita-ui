import { inject } from '@angular/core';

import { KuiToastService } from './kui-toast.service';

/**
 * Inject-function for showing toast notifications.
 *
 * Call once during injection context to get a reusable opener function
 * bound to the current injector scope.
 *
 * @example
 * ```ts
 * class MyComponent {
 *   private toast = kuiToast();
 *
 *   save() {
 *     this.api.save().subscribe({
 *       next: () => this.toast.open({ title: 'Saved', appearance: 'success' }),
 *       error: () => this.toast.open({ title: 'Failed', appearance: 'danger', persistent: true }),
 *     });
 *   }
 * }
 * ```
 */
export function kuiToast(): KuiToastService {
  return inject(KuiToastService);
}
