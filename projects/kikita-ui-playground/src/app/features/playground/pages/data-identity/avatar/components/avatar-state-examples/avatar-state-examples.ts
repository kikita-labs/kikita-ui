import { Component } from '@angular/core';

import { KuiAvatarComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiAvatarStatus } from '@kikita-labs/ui';

@Component({
  selector: 'app-avatar-state-examples',
  imports: [KuiAvatarComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './avatar-state-examples.html',
  styleUrl: './avatar-state-examples.scss',
})
export class AvatarStateExamples {
  protected readonly statuses: readonly { value: KuiAvatarStatus; label: string }[] = [
    { value: 'online', label: 'online' },
    { value: 'away', label: 'away' },
    { value: 'busy', label: 'busy' },
    { value: 'offline', label: 'offline' },
  ];
}
