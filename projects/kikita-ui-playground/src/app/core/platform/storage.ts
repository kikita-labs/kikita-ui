import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service } from '@angular/core';

/**
 * SSR-safe access to `localStorage`. Every method is a no-op on the server and when the browser
 * blocks storage (private mode, disabled site data, a full quota), so callers never need a guard.
 */
@Service()
export class StorageAdapter {
  private readonly platformId = inject(PLATFORM_ID);

  /** Returns the stored string for `key`, or `null` when it is missing or storage is unavailable. */
  read(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /** Stores `value` under `key`. Silently does nothing when storage is unavailable. */
  write(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage is blocked or full; the setting just does not persist.
    }
  }

  /** Removes the value stored under `key`. Silently does nothing when storage is unavailable. */
  remove(key: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.removeItem(key);
    } catch {
      // Storage is blocked; nothing to remove.
    }
  }
}
