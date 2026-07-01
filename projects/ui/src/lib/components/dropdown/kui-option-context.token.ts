import { InjectionToken, Signal } from '@angular/core';

/** Selection context shared by dropdown-like components with projected options. */
export interface KuiOptionContext {
  readonly isSelected: (value: unknown) => Signal<boolean> | boolean;
  readonly select: (value: unknown) => void;
  readonly close?: () => void;
  readonly shouldCloseOnSelect?: () => boolean;
}

/** Injection token used by `kuiOption` to access the active option host. */
export const KUI_OPTION_CONTEXT = new InjectionToken<KuiOptionContext>('KUI_OPTION_CONTEXT');
