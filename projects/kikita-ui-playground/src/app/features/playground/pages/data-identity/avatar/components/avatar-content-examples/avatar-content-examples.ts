import { Component } from '@angular/core';

import { KuiAvatarComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-avatar-content-examples',
  imports: [KuiAvatarComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './avatar-content-examples.html',
  styleUrl: './avatar-content-examples.scss',
})
export class AvatarContentExamples {}
