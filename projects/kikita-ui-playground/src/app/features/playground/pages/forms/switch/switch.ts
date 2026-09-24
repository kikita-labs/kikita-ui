import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { toSignal } from '@angular/core/rxjs-interop';

import { KuiFieldComponent, KuiSwitchDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SWITCH_FORM_DEFAULT_STATE, SWITCH_SIZE_VALUES } from './constants';
import { createSwitchSchema } from './helpers';

/** Shows Switch sizes, native states, field wiring, and Signal Forms validation. */
@Component({
  selector: 'app-switch',
  imports: [
    FormField,
    KuiFieldComponent,
    KuiSwitchDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './switch.html',
  styleUrl: './switch.scss',
})
export class Switch {
  private readonly transloco = inject(TranslocoService);

  private readonly model = signal(SWITCH_FORM_DEFAULT_STATE);

  private readonly activationMessage = toSignal(
    this.transloco.selectTranslate('errors.activationRequired', {}, { scope: 'switch' }),
    { initialValue: '' },
  );

  protected readonly sizeValues = SWITCH_SIZE_VALUES;

  protected readonly switchForm = form(
    this.model,
    createSwitchSchema(() => this.activationMessage()),
  );
}
