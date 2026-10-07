import { isDevMode } from '@angular/core';

const warned = /* @__PURE__ */ new Set<string>();

/**
 * Logs a developer warning once per distinct `key`, in development mode only. Chart inputs are read
 * inside `computed()` and can run many times, so a plain `console.warn` would repeat on every update.
 */
export function warnChartOnce(key: string, message: string): void {
  if (!isDevMode() || warned.has(key)) return;

  warned.add(key);
  console.warn(`[kikita-ui] ${message}`);
}
