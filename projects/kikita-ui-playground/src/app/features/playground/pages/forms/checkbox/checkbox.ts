import { afterNextRender, Component, type ElementRef, viewChild } from '@angular/core';

import { KuiCheckbox, KuiField, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-checkbox',
  imports: [KuiCheckbox, KuiField, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
})
export class Checkbox {
  readonly focusedCheckbox = viewChild.required<ElementRef<HTMLInputElement>>('focusedCheckbox');

  constructor() {
    afterNextRender({
      write: () =>
        this.focusedCheckbox().nativeElement.focus({ preventScroll: true, focusVisible: true }),
    });
  }
}
