import { Component } from '@angular/core';

import { KuiAvatar, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-avatar-content-examples',
  imports: [KuiAvatar, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './avatar-content-examples.html',
  styleUrl: './avatar-content-examples.scss',
})
export class AvatarContentExamples {}
