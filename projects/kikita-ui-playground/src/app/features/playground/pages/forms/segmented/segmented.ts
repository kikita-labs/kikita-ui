import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { toSignal } from '@angular/core/rxjs-interop';

import {
  KuiFieldComponent,
  KuiSegmentDirective,
  KuiSegmentedComponent,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SEGMENTED_FORM_DEFAULT_STATE } from './constants';
import { createSegmentedFormSchema } from './helpers';
import type { SegmentedFormModel } from './interfaces';

/** Shows Segmented selection, sizes, disabled states, and Signal Forms validation. */
@Component({
  selector: 'app-segmented',
  imports: [
    FormField,
    KuiFieldComponent,
    KuiSegmentDirective,
    KuiSegmentedComponent,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './segmented.html',
  styleUrl: './segmented.scss',
})
export class Segmented {
  private readonly transloco = inject(TranslocoService);

  protected readonly sizeOptions = [
    { value: 'xs', label: 'segmented.sizes.xs' },
    { value: 'sm', label: 'segmented.sizes.sm' },
    { value: 'md', label: 'segmented.sizes.md' },
    { value: 'lg', label: 'segmented.sizes.lg' },
  ] as const;

  protected readonly standaloneValue = signal('list');
  protected readonly standaloneTouchCount = signal(0);
  protected readonly formTouchCount = signal(0);
  protected readonly viewModel = signal<SegmentedFormModel>(SEGMENTED_FORM_DEFAULT_STATE);

  private readonly invalidMessage = toSignal(
    this.transloco.selectTranslate('forms.invalidMessage', {}, { scope: 'segmented' }),
    { initialValue: '' },
  );

  protected readonly viewForm = form(
    this.viewModel,
    createSegmentedFormSchema(() => this.invalidMessage()),
  );

  protected recordStandaloneTouch(): void {
    this.standaloneTouchCount.update((count) => count + 1);
  }

  protected recordFormTouch(): void {
    this.formTouchCount.update((count) => count + 1);
  }
}
