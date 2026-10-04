import { Component, signal } from '@angular/core';

import { KuiCard, KuiText } from '@kikita-labs/ui';

import { PlaygroundRoute } from '@app/enums';
import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows Card's supported appearances, sizes, interactive behavior, and semantic hosts. */
@Component({
  selector: 'app-card',
  imports: [KuiCard, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  protected readonly defaultCardTargetHref = `/${[
    PlaygroundRoute.Components,
    PlaygroundRoute.Card,
  ].join('/')}#card-default-target`;

  protected readonly appearances = [
    { key: 'surface', value: 'surface' },
    { key: 'elevated', value: 'elevated' },
    { key: 'sunken', value: 'sunken' },
  ] as const;

  protected readonly sizes = [
    { key: 'extraSmall', value: 'xs' },
    { key: 'small', value: 'sm' },
    { key: 'medium', value: 'md' },
    { key: 'large', value: 'lg' },
  ] as const;

  protected readonly activationCount = signal(0);

  protected activateCard(): void {
    this.activationCount.update((count) => count + 1);
  }
}
