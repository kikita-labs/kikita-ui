import { Component, signal, viewChild } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';

import {
  KuiButtonDirective,
  KuiFieldComponent,
  KuiInputDirective,
  KuiPopoverComponent,
  KuiPopoverForDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { POPOVER_FORM_DEFAULT_STATE } from './constants';
import type { PopoverFormModel } from './interfaces';

/** Shows a Signal Forms form in a focus-trapped Popover. */
@Component({
  selector: 'app-popover-form-examples',
  imports: [
    FormField,
    FormRoot,
    KuiButtonDirective,
    KuiFieldComponent,
    KuiInputDirective,
    KuiPopoverComponent,
    KuiPopoverForDirective,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './popover-form-examples.html',
  styleUrl: './popover-form-examples.scss',
})
export class PopoverFormExamples {
  private readonly model = signal<PopoverFormModel>(POPOVER_FORM_DEFAULT_STATE);

  protected readonly savedReminder = signal<string | null>(null);
  private readonly reminderPopover = viewChild.required<KuiPopoverComponent>('reminderPopover');

  protected readonly form = form(this.model, {
    submission: {
      action: async (field) => {
        this.savedReminder.set(field().value().subject);
        this.reminderPopover().close();
        return undefined;
      },
    },
  });
}
