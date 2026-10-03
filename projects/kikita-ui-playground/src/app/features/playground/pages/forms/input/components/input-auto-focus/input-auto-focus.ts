import { Component, signal } from '@angular/core';

import {
  KuiAutoFocusDirective,
  KuiButtonDirective,
  kuiDialog,
  KuiInputDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { InputAutoFocusDialog } from '../input-auto-focus-dialog';

/** Shows focus on mount, focus on request, and focus inside a dialog with the auto focus directive. */
@Component({
  selector: 'app-input-auto-focus',
  imports: [
    KuiAutoFocusDirective,
    KuiButtonDirective,
    KuiInputDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './input-auto-focus.html',
  styleUrl: './input-auto-focus.scss',
})
export class InputAutoFocus {
  private readonly openDialog = kuiDialog(InputAutoFocusDialog);

  protected readonly mounted = signal(false);

  protected readonly requested = signal(false);

  protected open(): void {
    this.openDialog().subscribe();
  }
}
