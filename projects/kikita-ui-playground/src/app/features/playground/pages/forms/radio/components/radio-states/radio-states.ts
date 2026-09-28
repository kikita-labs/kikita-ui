import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { toSignal } from '@angular/core/rxjs-interop';

import { KuiFieldComponent, KuiRadioDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

/** Shows selected, disabled, invalid, and Signal Forms radio states with native group semantics. */
@Component({
  selector: 'app-radio-states',
  imports: [
    FormField,
    KuiFieldComponent,
    KuiRadioDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './radio-states.html',
  styleUrl: './radio-states.scss',
})
export class RadioStates {
  private readonly transloco = inject(TranslocoService);

  private readonly requiredMessage = toSignal(
    this.transloco.selectTranslate('errors.signalPaymentRequired', {}, { scope: 'radio' }),
    { initialValue: '' },
  );

  private readonly model = signal({ paymentMethod: '' });

  protected readonly paymentForm = form(this.model, (path) =>
    required(path.paymentMethod, { message: this.requiredMessage }),
  );
}
