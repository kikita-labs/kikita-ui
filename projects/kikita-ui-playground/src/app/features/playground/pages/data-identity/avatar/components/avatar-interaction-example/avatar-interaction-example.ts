import { Component, signal } from '@angular/core';

import { KuiAvatar, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-avatar-interaction-example',
  imports: [KuiAvatar, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './avatar-interaction-example.html',
  styleUrl: './avatar-interaction-example.scss',
})
export class AvatarInteractionExample {
  protected readonly activationCount = signal(0);

  protected activate(): void {
    this.activationCount.update((count) => count + 1);
  }
}
