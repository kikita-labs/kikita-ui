import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  AvatarContentExamples,
  AvatarGroupExamples,
  AvatarInteractionExample,
  AvatarStateExamples,
  AvatarVariantExamples,
} from './components';

/** Shows Avatar content, supported variants, presence, loading, groups, and native-button use. */
@Component({
  selector: 'app-avatar',
  imports: [
    AvatarContentExamples,
    AvatarGroupExamples,
    AvatarInteractionExample,
    AvatarStateExamples,
    AvatarVariantExamples,
    KuiText,
    TranslocoPipe,
  ],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {}
