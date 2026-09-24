import { Component } from '@angular/core';

import { KuiFieldComponent, KuiInputDirective, kuiProvideFieldOptions } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-field-providers',
  imports: [KuiFieldComponent, KuiInputDirective, PlaygroundExampleCard, TranslocoPipe],
  providers: [kuiProvideFieldOptions({ size: 'sm', hideErrors: true })],
  templateUrl: './field-providers.html',
  styleUrl: './field-providers.scss',
})
export class FieldProviders {}
