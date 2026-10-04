import { Component, signal } from '@angular/core';

import { KuiButton, KuiDropdown, KuiDropdownFor, KuiOption, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { DROPDOWN_OPTIONS, EXTENDED_DROPDOWN_OPTIONS } from './constants';

/** Presents Dropdown options, panel sizing, positioning, and dismissal behavior. */
@Component({
  selector: 'app-dropdown',
  imports: [
    KuiButton,
    KuiDropdown,
    KuiDropdownFor,
    KuiOption,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
})
export class Dropdown {
  protected readonly defaultOptions = DROPDOWN_OPTIONS;
  protected readonly extendedOptions = EXTENDED_DROPDOWN_OPTIONS;

  protected readonly defaultSelection = signal<string | null>(null);
  protected readonly keepOpenSelection = signal<string | null>(null);
  protected readonly controlledOpen = signal(false);

  /** Stores the stable value emitted by the minimally configured standalone dropdown. */
  protected recordDefaultSelection(value: unknown): void {
    if (typeof value === 'string') this.defaultSelection.set(value);
  }

  /** Stores the stable value emitted by the keep-open standalone dropdown. */
  protected recordKeepOpenSelection(value: unknown): void {
    if (typeof value === 'string') this.keepOpenSelection.set(value);
  }
}
