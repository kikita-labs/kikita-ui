import { InjectionToken } from '@angular/core';

/**
 * @internal
 * Provided by a primitive that composes `kuiText` as a host directive and owns its own text
 * styling, so `defaults.typography` must not reach the composed directive.
 */
export const KUI_TEXT_IGNORES_DEFAULTS = new InjectionToken<boolean>('KUI_TEXT_IGNORES_DEFAULTS');
