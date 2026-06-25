import { InjectionToken, Signal } from '@angular/core';

export interface KuiOptionContext {
  readonly isSelected: (value: unknown) => Signal<boolean> | boolean;
  readonly select: (value: unknown) => void;
  readonly close?: () => void;
}

export const KUI_OPTION_CONTEXT = new InjectionToken<KuiOptionContext>('KUI_OPTION_CONTEXT');
